import type { Role as RoleType } from "./types";


interface RoleProps { value?: RoleType, role: RoleType, disabled?: boolean }

export default function Role ({ value, role, disabled }: RoleProps) {
  return <select name="role" defaultValue={value || 'viewer'} disabled={disabled}>
    { (role === 'owner' || disabled) && <option value="owner">Owner</option> }
    { (role === 'owner' || role === 'editor' || disabled) && <option value="editor">Editor</option> }
    <option value="viewer">Viewer</option>
  </select>
}