import path from 'path'
const MAXIMUM_BITRATE_144P = 300 * 10 ** 3 // 300 Kbps
const MAXIMUM_BITRATE_360P = 1 * 10 ** 6 // 1 Mbps

const MAXIMUM_BITRATE_720P = 5 * 10 ** 6 // 5Mbps
const MAXIMUM_BITRATE_1080P = 8 * 10 ** 6 // 8Mbps
const MAXIMUM_BITRATE_1440P = 16 * 10 ** 6 // 16Mbps

export const checkVideoHasAudio = async (filePath: string) => {
  const { $ } = await import('zx')
  const slash = (await import('slash')).default
  const { stdout } = await $`ffprobe ${[
    '-v',
    'error',
    '-select_streams',
    'a:0',
    '-show_entries',
    'stream=codec_type',
    '-of',
    'default=nw=1:nk=1',
    slash(filePath)
  ]}`
  return stdout.trim() === 'audio'
}

const getBitrate = async (filePath: string) => {
  const { $ } = await import('zx')
  const slash = (await import('slash')).default
  const { stdout } = await $`ffprobe ${[
    '-v',
    'error',
    '-select_streams',
    'v:0',
    '-show_entries',
    'stream=bit_rate',
    '-of',
    'default=nw=1:nk=1',
    slash(filePath)
  ]}`
  return Number(stdout.trim())
}

const getResolution = async (filePath: string) => {
  const { $ } = await import('zx')
  const slash = (await import('slash')).default

  const { stdout } = await $`ffprobe ${[
    '-v',
    'error',
    '-select_streams',
    'v:0',
    '-show_entries',
    'stream=width,height',
    '-of',
    'csv=s=x:p=0',
    slash(filePath)
  ]}`
  const resolution = stdout.trim().split('x')
  const [width, height] = resolution
  return {
    width: Number(width),
    height: Number(height)
  }
}

const getWidth = (height: number, resolution: { width: number; height: number }) => {
  const width = Math.round((height * resolution.width) / resolution.height)
  // Vì ffmpeg yêu cầu width và height phải là số chẵn
  return width % 2 === 0 ? width : width + 1
}

type EncodeByResolution = {
  inputPath: string
  isHasAudio: boolean
  resolution: {
    width: number
    height: number
  }
  outputSegmentPath: string
  outputPath: string
  bitrate: {
    144: number
    360: number
    720: number
    1080: number
    1440: number
    original: number
  }
}

const encodeMax360 = async ({
  bitrate,
  inputPath,
  isHasAudio,
  outputPath,
  outputSegmentPath,
  resolution
}: EncodeByResolution) => {
  const { $ } = await import('zx')
  const slash = (await import('slash')).default
  const videoResolutionVersionArgs = buildMultiResolutionEncodingArgs(bitrate, [360], resolution) //[144, 360]

  const args = ['-y', '-i', slash(inputPath), '-preset', 'veryslow', '-g', '48', '-crf', '20', '-sc_threshold', '0']
  if (isHasAudio) {
    args.push(...generateFfmpegMapArgs(1, ['-map', '0:0', '-map', '0:1']))
  } else {
    args.push(...generateFfmpegMapArgs(1, ['-map', '0:0']))
  }
  args.push(...videoResolutionVersionArgs, '-c:a', 'copy', '-var_stream_map')
  if (isHasAudio) {
    args.push(generateVarStreamMap(1))
  } else {
    args.push(generateVarStreamMapVersion(1))
  }
  args.push(
    '-master_pl_name',
    'master.m3u8',
    '-f',
    'hls',
    '-hls_time',
    '6',
    '-hls_list_size',
    '0',
    '-hls_segment_filename',
    slash(outputSegmentPath),
    slash(outputPath)
  )

  await $`ffmpeg ${args}`
  return true
}

const encodeMax720 = async ({
  bitrate,
  inputPath,
  isHasAudio,
  outputPath,
  outputSegmentPath,
  resolution
}: EncodeByResolution) => {
  const { $ } = await import('zx')
  const slash = (await import('slash')).default
  const videoResolutionVersionArgs = buildMultiResolutionEncodingArgs(bitrate, [360, 720], resolution) //[144, 360, 720]

  const args = ['-y', '-i', slash(inputPath), '-preset', 'veryslow', '-g', '48', '-crf', '23', '-sc_threshold', '0'] // crf, để 23 thay vì 17 là để cho nó giamnr bớt dung lượng file
  if (isHasAudio) {
    args.push(...generateFfmpegMapArgs(2, ['-map', '0:0', '-map', '0:1']))
  } else {
    args.push(...generateFfmpegMapArgs(2, ['-map', '0:0']))
  }
  args.push(...videoResolutionVersionArgs, '-c:a', 'copy', '-var_stream_map')
  if (isHasAudio) {
    args.push(generateVarStreamMap(2))
  } else {
    args.push(generateVarStreamMapVersion(2))
  }
  args.push(
    '-master_pl_name',
    'master.m3u8',
    '-f',
    'hls',
    '-hls_time',
    '6',
    '-hls_list_size',
    '0',
    '-hls_segment_filename',
    slash(outputSegmentPath),
    slash(outputPath)
  )

  await $`ffmpeg ${args}`
  return true
}

const encodeMax1080 = async ({
  bitrate,
  inputPath,
  isHasAudio,
  outputPath,
  outputSegmentPath,
  resolution
}: EncodeByResolution) => {
  const { $ } = await import('zx')
  const slash = (await import('slash')).default
  const videoResolutionVersionArgs = buildMultiResolutionEncodingArgs(bitrate, [360, 720, 1080], resolution)

  const args = ['-y', '-i', slash(inputPath), '-preset', 'veryslow', '-g', '48', '-crf', '23', '-sc_threshold', '0']
  if (isHasAudio) {
    args.push(...generateFfmpegMapArgs(3, ['-map', '0:0', '-map', '0:1']))
  } else {
    args.push(...generateFfmpegMapArgs(3, ['-map', '0:0']))
  }

  args.push(...videoResolutionVersionArgs, '-c:a', 'copy', '-var_stream_map')
  if (isHasAudio) {
    args.push(generateVarStreamMap(3))
    // nó tương ứng với số lần encode ra các chất lượng
  } else {
    args.push(generateVarStreamMapVersion(3))
    //   // v:0 v:1 v:2 v:3
  }
  args.push(
    '-master_pl_name',
    'master.m3u8',
    '-f',
    'hls',
    '-hls_time',
    '6',
    '-hls_list_size',
    '0',
    '-hls_segment_filename',
    slash(outputSegmentPath),
    slash(outputPath)
  )

  await $`ffmpeg ${args}`
  return true
}

const encodeMax1440 = async ({
  bitrate,
  inputPath,
  isHasAudio,
  outputPath,
  outputSegmentPath,
  resolution
}: EncodeByResolution) => {
  const { $ } = await import('zx')
  const slash = (await import('slash')).default
  const videoResolutionVersionArgs = buildMultiResolutionEncodingArgs(bitrate, [360, 720, 1080, 1440], resolution)

  const args = ['-y', '-i', slash(inputPath), '-preset', 'veryslow', '-g', '48', '-crf', '23', '-sc_threshold', '0']
  if (isHasAudio) {
    args.push(...generateFfmpegMapArgs(4, ['-map', '0:0', '-map', '0:1']))
  } else {
    args.push(...generateFfmpegMapArgs(4, ['-map', '0:0']))
  }
  args.push(...videoResolutionVersionArgs, '-c:a', 'copy', '-var_stream_map')
  if (isHasAudio) {
    args.push(generateVarStreamMap(4))
    // nó tương ứng với số lần encode ra các chất lượng
  } else {
    args.push(generateVarStreamMapVersion(4))
    //   // v:0 v:1 v:2 v:3 v:4 v:5
  }
  args.push(
    '-master_pl_name',
    'master.m3u8',
    '-f',
    'hls',
    '-hls_time',
    '6',
    '-hls_list_size',
    '0',
    '-hls_segment_filename',
    slash(outputSegmentPath),
    slash(outputPath)
  )

  await $`ffmpeg ${args}`
  return true
}

const encodeMaxOriginal = async ({
  bitrate,
  inputPath,
  isHasAudio,
  outputPath,
  outputSegmentPath,
  resolution
}: EncodeByResolution) => {
  const { $ } = await import('zx')
  const slash = (await import('slash')).default

  const args = ['-y', '-i', slash(inputPath), '-preset', 'veryslow', '-g', '48', '-crf', '23', '-sc_threshold', '0']
  if (isHasAudio) {
    args.push('-map', '0:0', '-map', '0:1', '-map', '0:0', '-map', '0:1', '-map', '0:0', '-map', '0:1')
  } else {
    args.push('-map', '0:0', '-map', '0:0', '-map', '0:0')
  }
  args.push(
    '-s:v:0',
    `${getWidth(720, resolution)}x720`,
    '-c:v:0',
    'libx264',
    '-b:v:0',
    `${bitrate[720]}`,
    '-s:v:1',
    `${getWidth(1080, resolution)}x1080`,
    '-c:v:1',
    'libx264',
    '-b:v:1',
    `${bitrate[1080]}`,
    '-s:v:2',
    `${resolution.width}x${resolution.height}`,
    '-c:v:2',
    'libx264',
    '-b:v:2',
    `${bitrate.original}`,
    '-c:a',
    'copy',
    '-var_stream_map'
  )
  if (isHasAudio) {
    args.push('v:0,a:0 v:1,a:1 v:2,a:2')
  } else {
    args.push('v:0 v:1 v:2')
  }
  args.push(
    '-master_pl_name',
    'master.m3u8',
    '-f',
    'hls',
    '-hls_time',
    '6',
    '-hls_list_size',
    '0',
    '-hls_segment_filename',
    slash(outputSegmentPath),
    slash(outputPath)
  )

  await $`ffmpeg ${args}`
  return true
}

export const encodeHLSWithMultipleVideoStreams = async (inputPath: string) => {
  const [bitrate, resolution] = await Promise.all([getBitrate(inputPath), getResolution(inputPath)])
  const parent_folder = path.join(inputPath, '..')
  const outputSegmentPath = path.join(parent_folder, 'v%v/fileSequence%d.ts')
  const outputPath = path.join(parent_folder, 'v%v/prog_index.m3u8')
  const bitrate144 = bitrate > MAXIMUM_BITRATE_144P ? MAXIMUM_BITRATE_144P : bitrate
  const bitrate360 = bitrate > MAXIMUM_BITRATE_360P ? MAXIMUM_BITRATE_360P : bitrate
  const bitrate720 = bitrate > MAXIMUM_BITRATE_720P ? MAXIMUM_BITRATE_720P : bitrate
  const bitrate1080 = bitrate > MAXIMUM_BITRATE_1080P ? MAXIMUM_BITRATE_1080P : bitrate
  const bitrate1440 = bitrate > MAXIMUM_BITRATE_1440P ? MAXIMUM_BITRATE_1440P : bitrate
  const isHasAudio = await checkVideoHasAudio(inputPath)
  let encodeFunc = encodeMax360
  // if (resolution.height > 144) {
  //   encodeFunc = encodeMax360
  // }
  if (resolution.height > 360) {
    encodeFunc = encodeMax720
  }
  if (resolution.height > 720) {
    encodeFunc = encodeMax1080
  }
  if (resolution.height > 1080) {
    encodeFunc = encodeMax1440
  }
  if (resolution.height > 1440) {
    encodeFunc = encodeMaxOriginal
  }
  await encodeFunc({
    bitrate: {
      144: bitrate144,
      360: bitrate360,
      720: bitrate720,
      1080: bitrate1080,
      1440: bitrate1440,
      original: bitrate
    },
    inputPath,
    isHasAudio,
    outputPath,
    outputSegmentPath,
    resolution
  })
  return true
}

// hàm trả về một chuỗi lặp lại được chuyền vào
function generateFfmpegMapArgs(count: number, value: string[]): string[] {
  const args: string[] = []
  for (let i = 0; i < count; i++) {
    args.push(...value)
  }
  return args
}

// hàm trả về số phiên bản chất lượng video  cần endcode

function buildMultiResolutionEncodingArgs(
  bitrates: EncodeByResolution['bitrate'],
  resolutions: number[],
  resolution: EncodeByResolution['resolution']
): string[] {
  const args: string[] = []

  resolutions.forEach((res, index) => {
    args.push(
      `-s:v:${index}`,
      `${getWidth(res, resolution)}x${res}`,
      `-c:v:${index}`,
      'libx264',
      `-b:v:${index}`,
      `${bitrates[res as keyof typeof bitrates]}`
    )
  })

  return args
}

// cho biết cần tạo ra bao nhiêu phiên bản audio
function generateVarStreamMap(count: number): string {
  return Array.from({ length: count }, (_, i) => `v:${i},a:${i}`).join(' ')
}
// số phiên bản audio cần có
function generateVarStreamMapVersion(count: number): string {
  return Array.from({ length: count }, (_, i) => `v:${i}`).join(' ')
}
