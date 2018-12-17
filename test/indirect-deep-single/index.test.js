import { bundle, clean, list, read } from "../util"

const root = __dirname

test("Indirect Deep Single", async () => {
  await bundle(root, "index.js", "output/index.js")

  expect(list(root, "output")).resolves.toMatchSnapshot()
  expect(read(root, "output/index.js")).resolves.toMatchSnapshot()

  await clean(root, "output")
})
