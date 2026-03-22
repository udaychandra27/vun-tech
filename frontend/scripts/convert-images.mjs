import sharp from "sharp"
import { readdirSync, statSync } from "fs"
import { join, extname, dirname, basename } from "path"

const dirs = ["public", "src/assets"]
const exts = [".jpg", ".jpeg", ".png"]

async function convertDir(dir) {
  let files
  try {
    files = readdirSync(dir)
  } catch {
    return
  }

  for (const file of files) {
    const full = join(dir, file)
    const stat = statSync(full)

    if (stat.isDirectory()) {
      await convertDir(full)
      continue
    }

    if (!exts.includes(extname(file).toLowerCase())) {
      continue
    }

    const out = join(dirname(full), `${basename(file, extname(file))}.webp`)
    await sharp(full).webp({ quality: 75 }).toFile(out)
    console.log(`Converted: ${full} -> ${out}`)
  }
}

for (const dir of dirs) {
  await convertDir(dir)
}

console.log("All images converted.")
