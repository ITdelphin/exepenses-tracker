import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
    const email = 'rwandasafee@gmail.com';
    const name = 'Rwanda Safe Admin';
    const password = 'saving2026@';

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        console.log(`⚠️ User with email ${email} already exists.`);
        const updated = await prisma.user.update({
            where: { email },
            data: { role: 'ADMIN' },
        });
        console.log(`✅ Roles updated to ADMIN for existing user.`);
        return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            role: 'ADMIN',
            isVerified: true
        },
    });

    // Create default categories for new user
    const defaultCategories = [
        { name: 'Food', icon: '🍔', color: '#FF6B6B', type: 'expense', isDefault: true },
        { name: 'Transport', icon: '🚗', color: '#4ECDC4', type: 'expense', isDefault: true },
        { name: 'Rent', icon: '🏠', color: '#45B7D1', type: 'expense', isDefault: true },
        { name: 'Shopping', icon: '🛍️', color: '#96CEB4', type: 'expense', isDefault: true },
        { name: 'Health', icon: '💊', color: '#FFEAA7', type: 'expense', isDefault: true },
        { name: 'Education', icon: '📚', color: '#DDA0DD', type: 'expense', isDefault: true },
        { name: 'Entertainment', icon: '🎬', color: '#98D8C8', type: 'expense', isDefault: true },
        { name: 'Bills', icon: '📄', color: '#F7DC6F', type: 'expense', isDefault: true },
        { name: 'Travel', icon: '✈️', color: '#BB8FCE', type: 'expense', isDefault: true },
        { name: 'Investment', icon: '📈', color: '#85C1E9', type: 'expense', isDefault: true },
        { name: 'Salary', icon: '💰', color: '#82E0AA', type: 'income', isDefault: true },
        { name: 'Business', icon: '💼', color: '#F8C471', type: 'income', isDefault: true },
        { name: 'Other', icon: '📌', color: '#ABB2B9', type: 'expense', isDefault: true },
    ];

    await prisma.category.createMany({
        data: defaultCategories.map(c => ({ ...c, userId: user.id })),
    });

    console.log(`✅ Success! New Admin account created:`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);

    await prisma.$disconnect();
}

createAdmin().catch((e) => {
    console.error('❌ Error:', e.message);
    process.exit(1);
});
