import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'ADMIN',
      isVerified: true,
    },
  });

  // Create default categories for admin
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

  for (const cat of defaultCategories) {
    await prisma.category.upsert({
      where: { id: `${admin.id}-${cat.name}` },
      update: {},
      create: { ...cat, userId: admin.id, id: `${admin.id}-${cat.name}` },
    });
  }

  console.log('Seed complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
