import pg from 'pg'

const { Pool } = pg

async function main() {
  const email = process.argv[2]
  const role = process.argv[3]

  if (!email || !role) {
    console.error('Usage: npx tsx scripts/set-role.ts <email> <role>')
    console.error('Roles: user, staff, admin')
    process.exit(1)
  }

  if (!['user', 'staff', 'admin'].includes(role)) {
    console.error('Invalid role. Must be: user, staff, admin')
    process.exit(1)
  }

  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is required')
    process.exit(1)
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL })

  try {
    const result = await pool.query(
      `UPDATE "user" SET role = $1 WHERE email = $2 RETURNING id, email, role`,
      [role, email],
    )

    if (result.rows.length === 0) {
      console.error(`User with email "${email}" not found in better-auth users table`)
      process.exit(1)
    }

    console.log(`✅ User "${email}" role updated to "${role}"`)
  } finally {
    await pool.end()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
