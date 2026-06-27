import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function promoteToAdmin() {
    const email = 'delphinngarambe@gmail.com';

    const user = await prisma.user.update({
        where: { email },
        data: { role: 'ADMIN' },
    });

    console.log(`✅ Success! User "${user.name}" (${user.email}) is now ADMIN.`);
    await prisma.$disconnect();
}

promoteToAdmin().catch((e) => {
    console.error('❌ Error:', e.message);
    process.exit(1);
});
