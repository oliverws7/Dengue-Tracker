require('dotenv').config();
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// CONFIGURAÇÕES
const MAX_DAYS = 7; // Quantos dias manter os backups
const BACKUP_ROOT = path.join(__dirname, '../../backups');

// Função para limpar backups antigos
const limparBackupsAntigos = () => {
    if (!fs.existsSync(BACKUP_ROOT)) return;

    const files = fs.readdirSync(BACKUP_ROOT);
    const now = Date.now();

    files.forEach(file => {
        const filePath = path.join(BACKUP_ROOT, file);
        const stats = fs.statSync(filePath);
        const daysOld = (now - stats.mtime.getTime()) / (1000 * 60 * 60 * 24);

        if (file.startsWith('backup-') && daysOld > MAX_DAYS) {
            // Se for diretório, usa rmSync com recursive (Node 14+)
            if (stats.isDirectory()) {
                fs.rmSync(filePath, { recursive: true, force: true });
            } else {
                fs.unlinkSync(filePath);
            }
            console.log(`🗑️ Backup antigo removido: ${file}`);
        }
    });
};

const realizarBackup = () => {
    const URI = process.env.MONGODB_URI;
    
    if (!URI) {
        console.error("❌ Erro: MONGODB_URI não definida no .env");
        return;
    }

    const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-');
    const FOLDER_NAME = `backup-${TIMESTAMP}`;

    if (!fs.existsSync(BACKUP_ROOT)) {
        fs.mkdirSync(BACKUP_ROOT, { recursive: true });
    }

    const outputDir = path.join(BACKUP_ROOT, FOLDER_NAME);

    // MELHORIA: Adicionado --gzip para comprimir os arquivos
    // MELHORIA: Adicionado --quiet para reduzir spam no log (opcional)
    const cmd = `mongodump --uri="${URI}" --out="${outputDir}" --gzip --numParallelCollections=1`;

    console.log(`⏳ Iniciando backup compactado para: ${FOLDER_NAME}...`);

    exec(cmd, (error, stdout, stderr) => {
        if (error) {
            console.error(`❌ Erro Crítico no Backup: ${error.message}`);
            return;
        }
        
        // mongodump escreve infos no stderr mesmo com sucesso, então verificamos se não houve erro crítico acima
        console.log(`✅ Backup concluído com sucesso!`);
        console.log(`📂 Local: ${outputDir}`);
        
        // Executar limpeza após sucesso
        limparBackupsAntigos();
    });
};

// Execução direta
if (require.main === module) {
    realizarBackup();
}

module.exports = realizarBackup;