#!/usr/bin/env node

const path = require('path');
const { json, lines, copyFiles, template, packageJson } = require('mrm-core');
const { cosmiconfigSync } = require('cosmiconfig');
const kleur = require('kleur');

const cwd = process.cwd();
const pkgName = path.basename(cwd);
const templateDir = path.resolve(__dirname, 'template');
const staticTextFiles = ['LICENSE', '.editorconfig'];

class Main {
  constructor() {
    staticTextFiles.forEach((name) => this.copyStaticTextFiles(name));
    this.gitignore();
    this.packageJson();
    this.eslint();
    this.prettier();
    this.readme();
  }

  copyStaticTextFiles(fileName) {
    this.logRunning(fileName);
    const file = lines(fileName);

    if (file.exists()) {
      this.logExist(fileName);
      return;
    }

    copyFiles(templateDir, fileName);
  }

  gitignore() {
    this.logRunning('.gitignore');
    const file = lines('.gitignore', [
      'logs/',
      'node_modules/',
      'coverage/',
      '.idea/',
      'run/',
      'dist/',
      '*.log',
      '*.swp',
      '.DS_Store',
      '.node',
    ]);

    if (file.exists()) {
      this.logExist('.gitignore');
      return;
    }

    file.save();
  }

  packageJson() {
    this.logRunning('package.json');
    const file = json('package.json', {
      name: pkgName,
      version: '0.0.0',
      description: '',
      main: 'index.js',
      scripts: {},
      dependencies: {},
      devDependencies: {},
      engines: {
        node: '>=10',
      },
      author: 'viko16 <16viko@gmail.com>',
      repository: `viko16/${pkgName}`,
      license: 'MIT',
    });

    if (file.exists()) {
      this.logExist('package.json');
      return;
    }

    file.save();
  }

  eslint() {
    this.logRunning('eslint (xo with space)');
    const searchResult = cosmiconfigSync('eslint', { stopDir: cwd }).search();

    if (searchResult) {
      this.logExist('eslint', `Found in ${searchResult.filepath}`);
      return;
    }

    const file = packageJson();
    if (file.get('xo')) {
      this.logExist('eslint', `Found in package.json xo section`);
      return;
    }

    console.log('adding xo config into package.json');
    file.set('xo', {
      space: true,
      prettier: true,
    });
    file.setScript('lint', 'xo --fix');
    file.prependScript('test', 'xo');
    file.save();
  }

  prettier() {
    this.logRunning('prettier');
    const searchResult = cosmiconfigSync('prettier', { stopDir: cwd }).search();

    if (searchResult) {
      this.logExist('prettier', `Found in ${searchResult.filepath}`);
      return;
    }

    const file = packageJson();
    file.set('prettier', {
      printWidth: 120,
      singleQuote: true,
      trailingComma: 'es5',
      bracketSpacing: true,
    });
    file.save();
  }

  readme() {
    this.logRunning('README.md');
    const file = template('README.md', path.resolve(templateDir, 'README.md'));

    if (file.exists()) {
      this.logExist('README.md');
      return;
    }

    file.apply({ pkgName }).save();
  }

  logRunning(taskName) {
    console.log(kleur.cyan(`\nRunning ${taskName}`));
  }

  logExist(taskName, moreMessage = '') {
    console.log(kleur.italic(`${taskName} exists. Skip. ${moreMessage}`));
  }
}

// eslint-disable-next-line no-new
new Main();
