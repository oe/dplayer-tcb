module.exports = {
  envId: 'tcb-demo-10cf5b',
  framework: {
    plugins: {
      db: {
        use: '@cloudbase/framework-plugin-database',
        inputs: {
          collections: [
            {
              collectionName: 'tcb_danmaku',
              aclTag: 'READONLY'
            }
          ]
        }
      }
    }
  }
};
