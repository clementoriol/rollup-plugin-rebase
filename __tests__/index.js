import fs from "fs-extra"
import { rollup } from "rollup"
import denodeify from "denodeify"
import shortid from "shortid"

import rebasePlugin from "../src"

const stat = denodeify(fs.stat)
const rimraf = denodeify(fs.remove)
const readFile = denodeify(fs.readFile)

const outputFolder = "./output/"

process.chdir(__dirname)

function bundle(entry, output)
{
  var plugin = rebasePlugin({ outputFolder, entry, verbose: true })

  return rollup({
    entry,
    external: plugin.isExternal,
    plugins: [ plugin ]
  })
    .then((result) => result.write({
      format: "es",
      dest: output
    }))
}

function fileExists(name)
{
  return stat(name)
    .then((result) => true, (error) => false)
}

test("Plain", () => {
  var outputFile = `${outputFolder}${shortid()}.js`
  return bundle("./fixtures/plain.js", outputFile).then(() => Promise.all([
    expect(fileExists(outputFile)).resolves.toBeTruthy()
  ])).then(Promise.all([
    rimraf(outputFile)
  ]))
})

test("Assets", () => {
  var outputFile = `${outputFolder}${shortid()}.js`
  var imageFile = `${outputFolder}image-l1JhGTH9.png`
  var fontFile = `${outputFolder}font-VrPi9W49.woff`
  var deepFile = `${outputFolder}blank-hk4Yl7Ly.gif`

  return bundle("./fixtures/assets.js", outputFile).then(() => Promise.all([
    expect(fileExists(outputFile)).resolves.toBeTruthy(),
    readFile(outputFile, "utf-8").then((content) => {
      /* eslint-disable no-template-curly-in-string */
      var expectedContent = "import _VrPi9W49 from './font-VrPi9W49.woff';\nimport _l1JhGTH9 from './image-l1JhGTH9.png';\nimport _hk4Yl7Ly from './blank-hk4Yl7Ly.gif';\n\nvar assets = `${_VrPi9W49}|${_l1JhGTH9}|${_hk4Yl7Ly}`;\n\nexport default assets;\n"
      expect(content).toBe(expectedContent)
    }),
    expect(fileExists(imageFile)).resolves.toBeTruthy(),
    expect(fileExists(fontFile)).resolves.toBeTruthy(),
    expect(fileExists(deepFile)).resolves.toBeTruthy()
  ])).then(Promise.all([
    rimraf(outputFile),
    rimraf(imageFile),
    rimraf(fontFile),
    rimraf(deepFile)
  ]))
})

test("Outside Assets", () => {
  var outputFile = `${outputFolder}${shortid()}.js`
  var imageFile = `${outputFolder}image-l1JhGTH9.png`
  var fontFile = `${outputFolder}font-VrPi9W49.woff`
  var deepFile = `${outputFolder}blank-hk4Yl7Ly.gif`

  return bundle("./fixtures/deep/assets-outside.js", outputFile).then(() => Promise.all([
    expect(fileExists(outputFile)).resolves.toBeTruthy(),
    readFile(outputFile, "utf-8").then((content) => {
      /* eslint-disable no-template-curly-in-string */
      var expectedContent = "import _VrPi9W49 from './font-VrPi9W49.woff';\nimport _l1JhGTH9 from './image-l1JhGTH9.png';\nimport _hk4Yl7Ly from './blank-hk4Yl7Ly.gif';\n\n/* eslint-disable filenames/match-regex */\nvar assetsOutside = `${_VrPi9W49}|${_l1JhGTH9}|${_hk4Yl7Ly}`;\n\nexport default assetsOutside;\n"
      expect(content).toBe(expectedContent)
    }),
    expect(fileExists(imageFile)).resolves.toBeTruthy(),
    expect(fileExists(fontFile)).resolves.toBeTruthy(),
    expect(fileExists(deepFile)).resolves.toBeTruthy()
  ])).then(Promise.all([
    rimraf(outputFile),
    rimraf(imageFile),
    rimraf(fontFile),
    rimraf(deepFile)
  ]))
})

test("Mixed Assets", () => {
  var outputFile = `${outputFolder}${shortid()}.js`
  var fontFile = `${outputFolder}font-VrPi9W49.woff`
  var svgFile = `${outputFolder}cappuccino-YauiPPOt.svg`
  var deepFile = `${outputFolder}blank-hk4Yl7Ly.gif`

  return bundle("./fixtures/deep/assets-mixed.js", outputFile).then(() => Promise.all([
    expect(fileExists(outputFile)).resolves.toBeTruthy(),
    readFile(outputFile, "utf-8").then((content) => {
      /* eslint-disable no-template-curly-in-string */
      var expectedContent = "import _VrPi9W49 from './font-VrPi9W49.woff';\nimport _YauiPPOt from './cappuccino-YauiPPOt.svg';\nimport _hk4Yl7Ly from './blank-hk4Yl7Ly.gif';\n\n/* eslint-disable filenames/match-regex */\nvar assetsMixed = `${_VrPi9W49}|${_YauiPPOt}|${_hk4Yl7Ly}`;\n\nexport default assetsMixed;\n"
      expect(content).toBe(expectedContent)
    }),
    expect(fileExists(fontFile)).resolves.toBeTruthy(),
    expect(fileExists(svgFile)).resolves.toBeTruthy(),
    expect(fileExists(deepFile)).resolves.toBeTruthy()
  ])).then(Promise.all([
    rimraf(outputFile),
    rimraf(fontFile),
    rimraf(svgFile),
    rimraf(deepFile)
  ]))
})