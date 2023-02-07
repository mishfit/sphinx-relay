import { spawnSync } from 'child_process'
import { sphinxLogger } from './logger'

function git(command: string): string | void {
  try {
    const output = spawnSync(`git ${command}`)
    const { stderr, stdout } = output


    if (stderr) {
      sphinxLogger.error(stderr.toString().trim())
    } else if (stdout) {
      const outputText = stdout.toString().trim()
      sphinxLogger.info(outputText)
      return outputText
    }
  } catch (e) {
    sphinxLogger.error(
      'Error running a git command, probably not running in a git repository'
    )
    sphinxLogger.error(e)
  }
}

export const commitHash = git('log -1 --pretty=format:%h') || ''
export const tag = git('describe --abbrev=0 --tags') || ''
