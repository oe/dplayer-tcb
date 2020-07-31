module.exports = {
  envId: 'tcb-demo-10cf5b',
  framework: {
    plugins: {
      client: {
        use: '@cloudbase/framework-plugin-website',
        inputs: {
          buildCommand: 'npm run build-demo',
          outputPath: 'dist',
          cloudPath: '/danmaku/'
        }
      },
      db: {
        use: '@cloudbase/framework-plugin-database',
        inputs: {
          collections: [
            {
              collectionName: 'tcb_player_danmaku',
              aclTag: 'READONLY'
            }
          ]
        }
      }
    }
  }
};
