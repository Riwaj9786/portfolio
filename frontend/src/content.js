import content from 'virtual:portfolio-content'
import { createContentReader } from './markdownContent.mjs'

// All portfolio details are bundled from frontend/FRONTEND_DATABASE.md.
export default { get: createContentReader(content, '/') }
