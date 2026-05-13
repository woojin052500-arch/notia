import { redirect } from 'next/navigation'

export default function SignupShortcut() {
  redirect('/auth/signup')
}
