import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt';

const prisma = new PrismaClient()

async function main() {
    let admin = await prisma.user.findUnique({ where:{email:'admin@admin.com'}});
    if(!admin){
        console.log("admin:", admin)
        const salt = await bcrypt.genSalt();
        const userPass = await bcrypt.hash('admin', salt);
        admin = await prisma.user.upsert({
        where: { email: 'admin' },
        update: {},
        create: {
            email: 'admin@admin.com',
            name: 'admin',
            login:'admin',
            password: userPass
        },
        })
    }
    console.log({ admin })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })