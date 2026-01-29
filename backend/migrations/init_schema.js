module.exports = {
  async up(db) {
    await db.collection('reports').createIndex({ "localizacao": "2dsphere" });
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    console.log('✅ Índices e Schema versionados no Atlas.');
  },

  async down(db) {
    // Remove os dois índices criados
    await db.collection('reports').dropIndex("localizacao_2dsphere");
    await db.collection('users').dropIndex("email_1"); 
  }
};