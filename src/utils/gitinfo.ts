import { spawnSync } from 'child_process'
import { sphinxLogger } from './logger'

function git(command: string): string | void {
  try {
    const output = spawnSync(`git ${command}`)
    const errorText = output.stderr.toString().trim()

    if (errorText) {
      sphinxLogger.error(errorText)
    } else {
      return output.stdout.toString().trim()
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
