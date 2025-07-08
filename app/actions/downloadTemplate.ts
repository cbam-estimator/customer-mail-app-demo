"use server"

export async function downloadTemplate() {
  const templateUrl = "https://github.com/iamqwame/dev_data_cbam_checker_cn/raw/main/customer_file_v2.xlsx"

  try {
    const response = await fetch(templateUrl)
    if (!response.ok) throw new Error("Failed to fetch template")

    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    return buffer
  } catch (error) {
    console.error("Error downloading template:", error)
    throw new Error("Failed to download template")
  }
}
