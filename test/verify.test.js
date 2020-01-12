import test from 'ava';
import nock from 'nock';
import {stub} from 'sinon';
import proxyquire from 'proxyquire';
import {authenticate} from './helpers/mock-github';

/* eslint camelcase: ["error", {properties: "never"}] */

const verify = proxyquire('../lib/verify', {
  './get-client': proxyquire('../lib/get-client'),
});

test.beforeEach(t => {
  // Mock logger
  t.context.log = stub();
  t.context.error = stub();
  t.context.logger = {log: t.context.log, error: t.context.error};
});

test.afterEach.always(() => {
  // Clear nock
  nock.cleanAll();
});

test.serial('Verify package, token and repository access', async t => {
  const owner = 'test_user';
  const repo = 'test_repo';
  const env = {GITEA_TOKEN: 'gitea_token'};
  const assets = [{path: 'lib/file.js'}, 'file.js'];
  const successComment = 'Test comment';
  const failTitle = 'Test title';
  const failComment = 'Test comment';
  const labels = ['semantic-release'];
  const github = authenticate(env)
    .get(`/repos/${owner}/${repo}`)
    .reply(200, {permissions: {push: true}});

  await t.notThrowsAsync(
    verify(
      {assets, successComment, failTitle, failComment, labels},
      {env, options: {repositoryUrl: `git+https://othertesturl.com/${owner}/${repo}.git`}, logger: t.context.logger}
    )
  );
  t.true(github.isDone());
});

test.serial(
  'Verify package, token and repository access with "asset", "successComment", "failTitle", "failComment" and "label" set to "null"',
  async t => {
    const owner = 'test_user';
    const repo = 'test_repo';
    const env = {GITEA_TOKEN: 'gitea_token'};
    const assets = null;
    const successComment = null;
    const failTitle = null;
    const failComment = null;
    const labels = null;
    const github = authenticate(env)
      .get(`/repos/${owner}/${repo}`)
      .reply(200, {permissions: {push: true}});

    await t.notThrowsAsync(
      verify(
        {assets, successComment, failTitle, failComment, labels},
        {env, options: {repositoryUrl: `git+https://othertesturl.com/${owner}/${repo}.git`}, logger: t.context.logger}
      )
    );
    t.true(github.isDone());
  }
);

test.serial('Verify package, token and repository access and custom URL with prefix', async t => {
  const owner = 'test_user';
  const repo = 'test_repo';
  const env = {GITEA_TOKEN: 'gitea_token'};
  const githubUrl = 'https://othertesturl.com:9090';
  const githubApiPathPrefix = 'prefix';
  const github = authenticate(env, {githubUrl, githubApiPathPrefix})
    .get(`/repos/${owner}/${repo}`)
    .reply(200, {permissions: {push: true}});

  await t.notThrowsAsync(
    verify(
      {githubUrl, githubApiPathPrefix},
      {env, options: {repositoryUrl: `git@othertesturl.com:${owner}/${repo}.git`}, logger: t.context.logger}
    )
  );

  t.true(github.isDone());
  t.deepEqual(t.context.log.args[0], ['Verify GitHub authentication (%s)', 'https://othertesturl.com:9090/prefix']);
});

test.serial('Verify package, token and repository access and custom URL without prefix', async t => {
  const owner = 'test_user';
  const repo = 'test_repo';
  const env = {GITEA_TOKEN: 'gitea_token'};
  const githubUrl = 'https://othertesturl.com:9090';
  const github = authenticate(env, {githubUrl})
    .get(`/repos/${owner}/${repo}`)
    .reply(200, {permissions: {push: true}});

  await t.notThrowsAsync(
    verify(
      {githubUrl},
      {env, options: {repositoryUrl: `git@othertesturl.com:${owner}/${repo}.git`}, logger: t.context.logger}
    )
  );

  t.true(github.isDone());
  t.deepEqual(t.context.log.args[0], ['Verify GitHub authentication (%s)', 'https://othertesturl.com:9090']);
});

test.serial('Verify package, token and repository access and shorthand repositoryUrl URL', async t => {
  const owner = 'test_user';
  const repo = 'test_repo';
  const env = {GITEA_TOKEN: 'gitea_token'};
  const githubUrl = 'https://othertesturl.com:9090';
  const github = authenticate(env, {githubUrl})
    .get(`/repos/${owner}/${repo}`)
    .reply(200, {permissions: {push: true}});

  await t.notThrowsAsync(
    verify({githubUrl}, {env, options: {repositoryUrl: `github:${owner}/${repo}`}, logger: t.context.logger})
  );

  t.true(github.isDone());
  t.deepEqual(t.context.log.args[0], ['Verify GitHub authentication (%s)', 'https://othertesturl.com:9090']);
});

test.serial('Verify package, token and repository with environment variables', async t => {
  const owner = 'test_user';
  const repo = 'test_repo';
  const env = {
    GITEA_URL: 'https://othertesturl.com:443',
    GITEA_TOKEN: 'gitea_token',
    GITEA_PREFIX: 'prefix',
  };
  const github = authenticate(env)
    .get(`/repos/${owner}/${repo}`)
    .reply(200, {permissions: {push: true}});

  await t.notThrowsAsync(
    verify({}, {env, options: {repositoryUrl: `git@othertesturl.com:${owner}/${repo}.git`}, logger: t.context.logger})
  );

  t.true(github.isDone());
  t.deepEqual(t.context.log.args[0], ['Verify GitHub authentication (%s)', 'https://othertesturl.com:443/prefix']);
});

test.serial('Verify package, token and repository access with alternative environment varialbes', async t => {
  const owner = 'test_user';
  const repo = 'test_repo';
  const env = {
    GITEA_URL: 'https://othertesturl.com:443',
    GITEA_TOKEN: 'gitea_token',
    GITEA_PREFIX: 'prefix',
  };
  const github = authenticate(env)
    .get(`/repos/${owner}/${repo}`)
    .reply(200, {permissions: {push: true}});

  await t.notThrowsAsync(
    verify({}, {env, options: {repositoryUrl: `git@othertesturl.com:${owner}/${repo}.git`}, logger: t.context.logger})
  );
  t.true(github.isDone());
});

test.serial('Verify "assets" is a String', async t => {
  const owner = 'test_user';
  const repo = 'test_repo';
  const env = {GITEA_TOKEN: 'gitea_token'};
  const assets = 'file2.js';
  const github = authenticate(env)
    .get(`/repos/${owner}/${repo}`)
    .reply(200, {permissions: {push: true}});

  await t.notThrowsAsync(
    verify(
      {assets},
      {env, options: {repositoryUrl: `git@othertesturl.com:${owner}/${repo}.git`}, logger: t.context.logger}
    )
  );

  t.true(github.isDone());
});

test.serial('Verify "assets" is an Object with a path property', async t => {
  const owner = 'test_user';
  const repo = 'test_repo';
  const env = {GITEA_TOKEN: 'gitea_token'};
  const assets = {path: 'file2.js'};
  const github = authenticate(env)
    .get(`/repos/${owner}/${repo}`)
    .reply(200, {permissions: {push: true}});

  await t.notThrowsAsync(
    verify(
      {assets},
      {env, options: {repositoryUrl: `git@othertesturl.com:${owner}/${repo}.git`}, logger: t.context.logger}
    )
  );

  t.true(github.isDone());
});

test.serial('Verify "assets" is an Array of Object with a path property', async t => {
  const owner = 'test_user';
  const repo = 'test_repo';
  const env = {GITEA_TOKEN: 'gitea_token'};
  const assets = [{path: 'file1.js'}, {path: 'file2.js'}];
  const github = authenticate(env)
    .get(`/repos/${owner}/${repo}`)
    .reply(200, {permissions: {push: true}});

  await t.notThrowsAsync(
    verify(
      {assets},
      {env, options: {repositoryUrl: `git@othertesturl.com:${owner}/${repo}.git`}, logger: t.context.logger}
    )
  );

  t.true(github.isDone());
});

test.serial('Verify "assets" is an Array of glob Arrays', async t => {
  const owner = 'test_user';
  const repo = 'test_repo';
  const env = {GITEA_TOKEN: 'gitea_token'};
  const assets = [['dist/**', '!**/*.js'], 'file2.js'];
  const github = authenticate(env)
    .get(`/repos/${owner}/${repo}`)
    .reply(200, {permissions: {push: true}});

  await t.notThrowsAsync(
    verify(
      {assets},
      {env, options: {repositoryUrl: `git@othertesturl.com:${owner}/${repo}.git`}, logger: t.context.logger}
    )
  );

  t.true(github.isDone());
});

test.serial('Verify "assets" is an Array of Object with a glob Arrays in path property', async t => {
  const owner = 'test_user';
  const repo = 'test_repo';
  const env = {GITEA_TOKEN: 'gitea_token'};
  const assets = [{path: ['dist/**', '!**/*.js']}, {path: 'file2.js'}];
  const github = authenticate(env)
    .get(`/repos/${owner}/${repo}`)
    .reply(200, {permissions: {push: true}});

  await t.notThrowsAsync(
    verify(
      {assets},
      {env, options: {repositoryUrl: `git@othertesturl.com:${owner}/${repo}.git`}, logger: t.context.logger}
    )
  );

  t.true(github.isDone());
});

test.serial('Verify "labels" is a String', async t => {
  const owner = 'test_user';
  const repo = 'test_repo';
  const env = {GITEA_TOKEN: 'gitea_token'};
  const labels = 'semantic-release';
  const github = authenticate(env)
    .get(`/repos/${owner}/${repo}`)
    .reply(200, {permissions: {push: true}});

  await t.notThrowsAsync(
    verify(
      {labels},
      {env, options: {repositoryUrl: `git@othertesturl.com:${owner}/${repo}.git`}, logger: t.context.logger}
    )
  );

  t.true(github.isDone());
});

test.serial('Verify "assignees" is a String', async t => {
  const owner = 'test_user';
  const repo = 'test_repo';
  const env = {GITEA_TOKEN: 'gitea_token'};
  const assignees = 'user';
  const github = authenticate(env)
    .get(`/repos/${owner}/${repo}`)
    .reply(200, {permissions: {push: true}});

  await t.notThrowsAsync(
    verify(
      {assignees},
      {env, options: {repositoryUrl: `git@othertesturl.com:${owner}/${repo}.git`}, logger: t.context.logger}
    )
  );

  t.true(github.isDone());
});

test.serial('Throw SemanticReleaseError for invalid token', async t => {
  const owner = 'test_user';
  const repo = 'test_repo';
  const env = {GITEA_TOKEN: 'gitea_token'};
  const github = authenticate(env)
    .get(`/repos/${owner}/${repo}`)
    .reply(401);

  const [error, ...errors] = await t.throwsAsync(
    verify({}, {env, options: {repositoryUrl: `https://gitea.io/${owner}/${repo}.git`}, logger: t.context.logger})
  );

  t.is(errors.length, 0);
  t.is(error.name, 'SemanticReleaseError');
  t.is(error.code, 'EINVALIDGHTOKEN');
  t.true(github.isDone());
});

test('Throw SemanticReleaseError for invalid repositoryUrl', async t => {
  const env = {GITEA_TOKEN: 'gitea_token'};

  const [error, ...errors] = await t.throwsAsync(
    verify({}, {env, options: {repositoryUrl: 'invalid_url'}, logger: t.context.logger})
  );

  t.is(errors.length, 0);
  t.is(error.name, 'SemanticReleaseError');
  t.is(error.code, 'EINVALIDGITEAURL');
});

test.serial("Throw SemanticReleaseError if token doesn't have the push permission on the repository", async t => {
  const owner = 'test_user';
  const repo = 'test_repo';
  const env = {GITEA_TOKEN: 'gitea_token'};
  const github = authenticate(env)
    .get(`/repos/${owner}/${repo}`)
    .reply(200, {permissions: {push: false}});

  const [error, ...errors] = await t.throwsAsync(
    verify({}, {env, options: {repositoryUrl: `https://gitea.io/${owner}/${repo}.git`}, logger: t.context.logger})
  );

  t.is(errors.length, 0);
  t.is(error.name, 'SemanticReleaseError');
  t.is(error.code, 'EGHNOPERMISSION');
  t.true(github.isDone());
});

test.serial("Throw SemanticReleaseError if the repository doesn't exist", async t => {
  const owner = 'test_user';
  const repo = 'test_repo';
  const env = {GITEA_TOKEN: 'gitea_token'};
  const github = authenticate(env)
    .get(`/repos/${owner}/${repo}`)
    .times(4)
    .reply(404);

  const [error, ...errors] = await t.throwsAsync(
    verify({}, {env, options: {repositoryUrl: `https://gitea.io/${owner}/${repo}.git`}, logger: t.context.logger})
  );

  t.is(errors.length, 0);
  t.is(error.name, 'SemanticReleaseError');
  t.is(error.code, 'EMISSINGREPO');
  t.true(github.isDone());
});

test.serial('Throw error if github return any other errors', async t => {
  const owner = 'test_user';
  const repo = 'test_repo';
  const env = {GITEA_TOKEN: 'gitea_token'};
  const github = authenticate(env)
    .get(`/repos/${owner}/${repo}`)
    .reply(500);

  const error = await t.throwsAsync(
    verify({}, {env, options: {repositoryUrl: `https://gitea.io/${owner}/${repo}.git`}, logger: t.context.logger})
  );

  t.is(error.status, 500);
  t.true(github.isDone());
});

test.serial('Throw SemanticReleaseError if "assets" option is not a String or an Array of Objects', async t => {
  const owner = 'test_user';
  const repo = 'test_repo';
  const env = {GITEA_TOKEN: 'gitea_token'};
  const assets = 42;
  const github = authenticate(env)
    .get(`/repos/${owner}/${repo}`)
    .reply(200, {permissions: {push: true}});

  const [error, ...errors] = await t.throwsAsync(
    verify(
      {assets},
      {env, options: {repositoryUrl: `https://gitea.io/${owner}/${repo}.git`}, logger: t.context.logger}
    )
  );

  t.is(errors.length, 0);
  t.is(error.name, 'SemanticReleaseError');
  t.is(error.code, 'EINVALIDASSETS');
  t.true(github.isDone());
});

test.serial('Throw SemanticReleaseError if "assets" option is an Array with invalid elements', async t => {
  const owner = 'test_user';
  const repo = 'test_repo';
  const env = {GITEA_TOKEN: 'gitea_token'};
  const assets = ['file.js', 42];
  const github = authenticate(env)
    .get(`/repos/${owner}/${repo}`)
    .reply(200, {permissions: {push: true}});

  const [error, ...errors] = await t.throwsAsync(
    verify(
      {assets},
      {env, options: {repositoryUrl: `https://gitea.io/${owner}/${repo}.git`}, logger: t.context.logger}
    )
  );

  t.is(errors.length, 0);
  t.is(error.name, 'SemanticReleaseError');
  t.is(error.code, 'EINVALIDASSETS');
  t.true(github.isDone());
});

test.serial('Throw SemanticReleaseError if "assets" option is an Object missing the "path" property', async t => {
  const owner = 'test_user';
  const repo = 'test_repo';
  const env = {GITEA_TOKEN: 'gitea_token'};
  const assets = {name: 'file.js'};
  const github = authenticate(env)
    .get(`/repos/${owner}/${repo}`)
    .reply(200, {permissions: {push: true}});

  const [error, ...errors] = await t.throwsAsync(
    verify(
      {assets},
      {env, options: {repositoryUrl: `https://gitea.io/${owner}/${repo}.git`}, logger: t.context.logger}
    )
  );

  t.is(errors.length, 0);
  t.is(error.name, 'SemanticReleaseError');
  t.is(error.code, 'EINVALIDASSETS');
  t.true(github.isDone());
});

test.serial(
  'Throw SemanticReleaseError if "assets" option is an Array with objects missing the "path" property',
  async t => {
    const owner = 'test_user';
    const repo = 'test_repo';
    const env = {GITEA_TOKEN: 'gitea_token'};
    const assets = [{path: 'lib/file.js'}, {name: 'file.js'}];
    const github = authenticate(env)
      .get(`/repos/${owner}/${repo}`)
      .reply(200, {permissions: {push: true}});

    const [error, ...errors] = await t.throwsAsync(
      verify(
        {assets},
        {env, options: {repositoryUrl: `https://gitea.io/${owner}/${repo}.git`}, logger: t.context.logger}
      )
    );

    t.is(errors.length, 0);
    t.is(error.name, 'SemanticReleaseError');
    t.is(error.code, 'EINVALIDASSETS');
    t.true(github.isDone());
  }
);

test.serial('Throw SemanticReleaseError if "successComment" option is not a String', async t => {
  const owner = 'test_user';
  const repo = 'test_repo';
  const env = {GITEA_TOKEN: 'gitea_token'};
  const successComment = 42;
  const github = authenticate(env)
    .get(`/repos/${owner}/${repo}`)
    .reply(200, {permissions: {push: true}});

  const [error, ...errors] = await t.throwsAsync(
    verify(
      {successComment},
      {env, options: {repositoryUrl: `https://gitea.io/${owner}/${repo}.git`}, logger: t.context.logger}
    )
  );

  t.is(errors.length, 0);
  t.is(error.name, 'SemanticReleaseError');
  t.is(error.code, 'EINVALIDSUCCESSCOMMENT');
  t.true(github.isDone());
});

test.serial('Throw SemanticReleaseError if "successComment" option is an empty String', async t => {
  const owner = 'test_user';
  const repo = 'test_repo';
  const env = {GITEA_TOKEN: 'gitea_token'};
  const successComment = '';
  const github = authenticate(env)
    .get(`/repos/${owner}/${repo}`)
    .reply(200, {permissions: {push: true}});

  const [error, ...errors] = await t.throwsAsync(
    verify(
      {successComment},
      {env, options: {repositoryUrl: `https://gitea.io/${owner}/${repo}.git`}, logger: t.context.logger}
    )
  );

  t.is(errors.length, 0);
  t.is(error.name, 'SemanticReleaseError');
  t.is(error.code, 'EINVALIDSUCCESSCOMMENT');
  t.true(github.isDone());
});

test.serial('Throw SemanticReleaseError if "successComment" option is a whitespace String', async t => {
  const owner = 'test_user';
  const repo = 'test_repo';
  const env = {GITEA_TOKEN: 'gitea_token'};
  const successComment = '  \n \r ';
  const github = authenticate(env)
    .get(`/repos/${owner}/${repo}`)
    .reply(200, {permissions: {push: true}});

  const [error, ...errors] = await t.throwsAsync(
    verify(
      {successComment},
      {env, options: {repositoryUrl: `https://gitea.io/${owner}/${repo}.git`}, logger: t.context.logger}
    )
  );

  t.is(errors.length, 0);
  t.is(error.name, 'SemanticReleaseError');
  t.is(error.code, 'EINVALIDSUCCESSCOMMENT');
  t.true(github.isDone());
});

test.serial('Throw SemanticReleaseError if "failTitle" option is not a String', async t => {
  const owner = 'test_user';
  const repo = 'test_repo';
  const env = {GITEA_TOKEN: 'gitea_token'};
  const failTitle = 42;
  const github = authenticate(env)
    .get(`/repos/${owner}/${repo}`)
    .reply(200, {permissions: {push: true}});

  const [error, ...errors] = await t.throwsAsync(
    verify(
      {failTitle},
      {env, options: {repositoryUrl: `https://gitea.io/${owner}/${repo}.git`}, logger: t.context.logger}
    )
  );

  t.is(errors.length, 0);
  t.is(error.name, 'SemanticReleaseError');
  t.is(error.code, 'EINVALIDFAILTITLE');
  t.true(github.isDone());
});

test.serial('Throw SemanticReleaseError if "failTitle" option is an empty String', async t => {
  const owner = 'test_user';
  const repo = 'test_repo';
  const env = {GITEA_TOKEN: 'gitea_token'};
  const failTitle = '';
  const github = authenticate(env)
    .get(`/repos/${owner}/${repo}`)
    .reply(200, {permissions: {push: true}});

  const [error, ...errors] = await t.throwsAsync(
    verify(
      {failTitle},
      {env, options: {repositoryUrl: `https://gitea.io/${owner}/${repo}.git`}, logger: t.context.logger}
    )
  );

  t.is(errors.length, 0);
  t.is(error.name, 'SemanticReleaseError');
  t.is(error.code, 'EINVALIDFAILTITLE');
  t.true(github.isDone());
});

test.serial('Throw SemanticReleaseError if "failTitle" option is a whitespace String', async t => {
  const owner = 'test_user';
  const repo = 'test_repo';
  const env = {GITEA_TOKEN: 'gitea_token'};
  const failTitle = '  \n \r ';
  const github = authenticate(env)
    .get(`/repos/${owner}/${repo}`)
    .reply(200, {permissions: {push: true}});

  const [error, ...errors] = await t.throwsAsync(
    verify(
      {failTitle},
      {env, options: {repositoryUrl: `https://gitea.io/${owner}/${repo}.git`}, logger: t.context.logger}
    )
  );

  t.is(errors.length, 0);
  t.is(error.name, 'SemanticReleaseError');
  t.is(error.code, 'EINVALIDFAILTITLE');
  t.true(github.isDone());
});

test.serial('Throw SemanticReleaseError if "failComment" option is not a String', async t => {
  const owner = 'test_user';
  const repo = 'test_repo';
  const env = {GITEA_TOKEN: 'gitea_token'};
  const failComment = 42;
  const github = authenticate(env)
    .get(`/repos/${owner}/${repo}`)
    .reply(200, {permissions: {push: true}});

  const [error, ...errors] = await t.throwsAsync(
    verify(
      {failComment},
      {env, options: {repositoryUrl: `https://gitea.io/${owner}/${repo}.git`}, logger: t.context.logger}
    )
  );

  t.is(errors.length, 0);
  t.is(error.name, 'SemanticReleaseError');
  t.is(error.code, 'EINVALIDFAILCOMMENT');
  t.true(github.isDone());
});

test.serial('Throw SemanticReleaseError if "failComment" option is an empty String', async t => {
  const owner = 'test_user';
  const repo = 'test_repo';
  const env = {GITEA_TOKEN: 'gitea_token'};
  const failComment = '';
  const github = authenticate(env)
    .get(`/repos/${owner}/${repo}`)
    .reply(200, {permissions: {push: true}});

  const [error, ...errors] = await t.throwsAsync(
    verify(
      {failComment},
      {env, options: {repositoryUrl: `https://gitea.io/${owner}/${repo}.git`}, logger: t.context.logger}
    )
  );

  t.is(errors.length, 0);
  t.is(error.name, 'SemanticReleaseError');
  t.is(error.code, 'EINVALIDFAILCOMMENT');
  t.true(github.isDone());
});

test.serial('Throw SemanticReleaseError if "failComment" option is a whitespace String', async t => {
  const owner = 'test_user';
  const repo = 'test_repo';
  const env = {GITEA_TOKEN: 'gitea_token'};
  const failComment = '  \n \r ';
  const github = authenticate(env)
    .get(`/repos/${owner}/${repo}`)
    .reply(200, {permissions: {push: true}});

  const [error, ...errors] = await t.throwsAsync(
    verify(
      {failComment},
      {env, options: {repositoryUrl: `https://gitea.io/${owner}/${repo}.git`}, logger: t.context.logger}
    )
  );

  t.is(errors.length, 0);
  t.is(error.name, 'SemanticReleaseError');
  t.is(error.code, 'EINVALIDFAILCOMMENT');
  t.true(github.isDone());
});

test.serial('Throw SemanticReleaseError if "labels" option is not a String or an Array of String', async t => {
  const owner = 'test_user';
  const repo = 'test_repo';
  const env = {GITEA_TOKEN: 'gitea_token'};
  const labels = 42;
  const github = authenticate(env)
    .get(`/repos/${owner}/${repo}`)
    .reply(200, {permissions: {push: true}});

  const [error, ...errors] = await t.throwsAsync(
    verify(
      {labels},
      {env, options: {repositoryUrl: `https://gitea.io/${owner}/${repo}.git`}, logger: t.context.logger}
    )
  );

  t.is(errors.length, 0);
  t.is(error.name, 'SemanticReleaseError');
  t.is(error.code, 'EINVALIDLABELS');
  t.true(github.isDone());
});

test.serial('Throw SemanticReleaseError if "labels" option is an Array with invalid elements', async t => {
  const owner = 'test_user';
  const repo = 'test_repo';
  const env = {GITEA_TOKEN: 'gitea_token'};
  const labels = ['label1', 42];
  const github = authenticate(env)
    .get(`/repos/${owner}/${repo}`)
    .reply(200, {permissions: {push: true}});

  const [error, ...errors] = await t.throwsAsync(
    verify(
      {labels},
      {env, options: {repositoryUrl: `https://gitea.io/${owner}/${repo}.git`}, logger: t.context.logger}
    )
  );

  t.is(errors.length, 0);
  t.is(error.name, 'SemanticReleaseError');
  t.is(error.code, 'EINVALIDLABELS');
  t.true(github.isDone());
});

test.serial('Throw SemanticReleaseError if "labels" option is a whitespace String', async t => {
  const owner = 'test_user';
  const repo = 'test_repo';
  const env = {GITEA_TOKEN: 'gitea_token'};
  const labels = '  \n \r ';
  const github = authenticate(env)
    .get(`/repos/${owner}/${repo}`)
    .reply(200, {permissions: {push: true}});

  const [error, ...errors] = await t.throwsAsync(
    verify(
      {labels},
      {env, options: {repositoryUrl: `https://gitea.io/${owner}/${repo}.git`}, logger: t.context.logger}
    )
  );

  t.is(errors.length, 0);
  t.is(error.name, 'SemanticReleaseError');
  t.is(error.code, 'EINVALIDLABELS');
  t.true(github.isDone());
});

test.serial('Throw SemanticReleaseError if "assignees" option is not a String or an Array of String', async t => {
  const owner = 'test_user';
  const repo = 'test_repo';
  const env = {GITEA_TOKEN: 'gitea_token'};
  const assignees = 42;
  const github = authenticate(env)
    .get(`/repos/${owner}/${repo}`)
    .reply(200, {permissions: {push: true}});

  const [error, ...errors] = await t.throwsAsync(
    verify(
      {assignees},
      {env, options: {repositoryUrl: `https://gitea.io/${owner}/${repo}.git`}, logger: t.context.logger}
    )
  );

  t.is(errors.length, 0);
  t.is(error.name, 'SemanticReleaseError');
  t.is(error.code, 'EINVALIDASSIGNEES');
  t.true(github.isDone());
});

test.serial('Throw SemanticReleaseError if "assignees" option is an Array with invalid elements', async t => {
  const owner = 'test_user';
  const repo = 'test_repo';
  const env = {GITEA_TOKEN: 'gitea_token'};
  const assignees = ['user', 42];
  const github = authenticate(env)
    .get(`/repos/${owner}/${repo}`)
    .reply(200, {permissions: {push: true}});

  const [error, ...errors] = await t.throwsAsync(
    verify(
      {assignees},
      {env, options: {repositoryUrl: `https://gitea.io/${owner}/${repo}.git`}, logger: t.context.logger}
    )
  );

  t.is(errors.length, 0);
  t.is(error.name, 'SemanticReleaseError');
  t.is(error.code, 'EINVALIDASSIGNEES');
  t.true(github.isDone());
});

test.serial('Throw SemanticReleaseError if "assignees" option is a whitespace String', async t => {
  const owner = 'test_user';
  const repo = 'test_repo';
  const env = {GITEA_TOKEN: 'gitea_token'};
  const assignees = '  \n \r ';
  const github = authenticate(env)
    .get(`/repos/${owner}/${repo}`)
    .reply(200, {permissions: {push: true}});

  const [error, ...errors] = await t.throwsAsync(
    verify(
      {assignees},
      {env, options: {repositoryUrl: `https://gitea.io/${owner}/${repo}.git`}, logger: t.context.logger}
    )
  );

  t.is(errors.length, 0);
  t.is(error.name, 'SemanticReleaseError');
  t.is(error.code, 'EINVALIDASSIGNEES');
  t.true(github.isDone());
});

test.serial('Throw SemanticReleaseError if "releasedLabels" option is not a String or an Array of String', async t => {
  const owner = 'test_user';
  const repo = 'test_repo';
  const env = {GITEA_TOKEN: 'gitea_token'};
  const releasedLabels = 42;
  const github = authenticate(env)
    .get(`/repos/${owner}/${repo}`)
    .reply(200, {permissions: {push: true}});

  const [error, ...errors] = await t.throwsAsync(
    verify(
      {releasedLabels},
      {env, options: {repositoryUrl: `https://gitea.io/${owner}/${repo}.git`}, logger: t.context.logger}
    )
  );

  t.is(errors.length, 0);
  t.is(error.name, 'SemanticReleaseError');
  t.is(error.code, 'EINVALIDRELEASEDLABELS');
  t.true(github.isDone());
});

test.serial('Throw SemanticReleaseError if "releasedLabels" option is an Array with invalid elements', async t => {
  const owner = 'test_user';
  const repo = 'test_repo';
  const env = {GITEA_TOKEN: 'gitea_token'};
  const releasedLabels = ['label1', 42];
  const github = authenticate(env)
    .get(`/repos/${owner}/${repo}`)
    .reply(200, {permissions: {push: true}});

  const [error, ...errors] = await t.throwsAsync(
    verify(
      {releasedLabels},
      {env, options: {repositoryUrl: `https://gitea.io/${owner}/${repo}.git`}, logger: t.context.logger}
    )
  );

  t.is(errors.length, 0);
  t.is(error.name, 'SemanticReleaseError');
  t.is(error.code, 'EINVALIDRELEASEDLABELS');
  t.true(github.isDone());
});

test.serial('Throw SemanticReleaseError if "releasedLabels" option is a whitespace String', async t => {
  const owner = 'test_user';
  const repo = 'test_repo';
  const env = {GITEA_TOKEN: 'gitea_token'};
  const releasedLabels = '  \n \r ';
  const github = authenticate(env)
    .get(`/repos/${owner}/${repo}`)
    .reply(200, {permissions: {push: true}});

  const [error, ...errors] = await t.throwsAsync(
    verify(
      {releasedLabels},
      {env, options: {repositoryUrl: `https://gitea.io/${owner}/${repo}.git`}, logger: t.context.logger}
    )
  );

  t.is(errors.length, 0);
  t.is(error.name, 'SemanticReleaseError');
  t.is(error.code, 'EINVALIDRELEASEDLABELS');
  t.true(github.isDone());
});