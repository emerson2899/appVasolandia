const { withProjectBuildGradle } = require('@expo/config-plugins');

module.exports = (config) => {
  return withProjectBuildGradle(config, (config) => {
    if (config.modResults.language === 'groovy') {
      config.modResults.contents = fixInsecureRepo(config.modResults.contents);
    }
    return config;
  });
};

function fixInsecureRepo(content) {
  // Esta lógica injeta a permissão diretamente no fluxo de resolução de repositórios
  // do Gradle, afetando como ele lida com dependências de terceiros.
  const allowInsecureBlock = `
allprojects {
    repositories {
        maven {
            url "http://jcenter.bintray.com"
            allowInsecureProtocol = true
        }
    }
}
`;

  if (!content.includes('allowInsecureProtocol = true')) {
    return content + allowInsecureBlock;
  }
  return content;
}