import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import bcrypt from 'bcryptjs'
import path from 'path'

const dbPath = path.join(process.cwd(), 'prisma', 'dev.db')
const adapter = new PrismaLibSql({ url: `file:${dbPath}` })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Seeding database...')

  // Create household
  const household = await prisma.household.upsert({
    where: { inviteCode: 'FAMILIA-SILVA-2024' },
    update: {},
    create: {
      name: 'Família Silva',
      inviteCode: 'FAMILIA-SILVA-2024',
    },
  })

  console.log('Created household:', household.name)

  // Create admin user
  const adminPassword = await bcrypt.hash('123456', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      name: 'Admin Silva',
      email: 'admin@test.com',
      password: adminPassword,
      householdId: household.id,
      role: 'admin',
    },
  })

  console.log('Created admin user:', admin.email)

  // Create member user
  const memberPassword = await bcrypt.hash('123456', 12)
  const member = await prisma.user.upsert({
    where: { email: 'member@test.com' },
    update: {},
    create: {
      name: 'Maria Silva',
      email: 'member@test.com',
      password: memberPassword,
      householdId: household.id,
      role: 'member',
    },
  })

  console.log('Created member user:', member.email)

  // Delete existing items for household to avoid duplicates
  await prisma.item.deleteMany({ where: { householdId: household.id } })

  // Create pantry items
  const items = [
    { name: 'Arroz', category: 'GRAOS_CEREAIS', quantity: 5, unit: 'kg', minQuantity: 2 },
    { name: 'Feijão Carioca', category: 'GRAOS_CEREAIS', quantity: 2, unit: 'kg', minQuantity: 1 },
    { name: 'Açúcar', category: 'GRAOS_CEREAIS', quantity: 3, unit: 'kg', minQuantity: 1 },
    { name: 'Sal', category: 'CONDIMENTOS', quantity: 1, unit: 'kg', minQuantity: 0.5 },
    { name: 'Azeite de Oliva', category: 'CONDIMENTOS', quantity: 500, unit: 'ml', minQuantity: 200 },
    { name: 'Leite Integral', category: 'LATICINIOS', quantity: 1, unit: 'litro', minQuantity: 2 },
    { name: 'Queijo Mussarela', category: 'LATICINIOS', quantity: 150, unit: 'g', minQuantity: 200 },
    { name: 'Iogurte Natural', category: 'LATICINIOS', quantity: 4, unit: 'unidade', minQuantity: 2 },
    { name: 'Frango Congelado', category: 'CONGELADOS', quantity: 2, unit: 'kg', minQuantity: 1 },
    { name: 'Carne Moída', category: 'CARNES', quantity: 500, unit: 'g', minQuantity: 300 },
    { name: 'Detergente', category: 'LIMPEZA', quantity: 3, unit: 'unidade', minQuantity: 2 },
    { name: 'Sabão em Pó', category: 'LIMPEZA', quantity: 0.3, unit: 'kg', minQuantity: 0.5 },
    { name: 'Shampoo', category: 'HIGIENE', quantity: 1, unit: 'unidade', minQuantity: 1 },
    { name: 'Água Mineral', category: 'BEBIDAS', quantity: 6, unit: 'litro', minQuantity: 3 },
    { name: 'Café Moído', category: 'BEBIDAS', quantity: 150, unit: 'g', minQuantity: 200 },
    { name: 'Pão de Forma', category: 'PADARIA', quantity: 0, unit: 'pacote', minQuantity: 1 },
    { name: 'Macarrão Espaguete', category: 'GRAOS_CEREAIS', quantity: 500, unit: 'g', minQuantity: 200 },
    { name: 'Extrato de Tomate', category: 'CONDIMENTOS', quantity: 3, unit: 'lata', minQuantity: 2 },
  ]

  const createdItems = []
  for (const item of items) {
    const created = await prisma.item.create({
      data: {
        ...item,
        householdId: household.id,
      },
    })
    createdItems.push(created)
  }

  console.log(`Created ${items.length} pantry items`)

  // Create item history entries
  for (const item of createdItems.slice(0, 8)) {
    await prisma.itemHistory.create({
      data: {
        itemId: item.id,
        oldQuantity: item.quantity - 1,
        newQuantity: item.quantity,
        action: 'purchase',
        userId: admin.id,
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      },
    })
  }
  for (const item of createdItems.slice(3, 7)) {
    await prisma.itemHistory.create({
      data: {
        itemId: item.id,
        oldQuantity: item.quantity + 1,
        newQuantity: item.quantity,
        action: 'consumption',
        userId: member.id,
        createdAt: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000),
      },
    })
  }

  // Create seasonality data (delete existing first)
  await prisma.seasonality.deleteMany()

  const seasonalityData = [
    // Sul region
    { product: 'Morango', idealMonths: JSON.stringify([6, 7, 8, 9, 10]), region: 'Sul', description: 'Melhor época para morangos da serra gaúcha' },
    { product: 'Uva', idealMonths: JSON.stringify([1, 2, 3, 12]), region: 'Sul', description: 'Vindima no Rio Grande do Sul' },
    { product: 'Maçã', idealMonths: JSON.stringify([2, 3, 4, 5]), region: 'Sul', description: 'Maçã de Santa Catarina' },
    { product: 'Pêssego', idealMonths: JSON.stringify([11, 12, 1, 2]), region: 'Sul', description: 'Pêssego serrano' },
    { product: 'Alho', idealMonths: JSON.stringify([11, 12, 1]), region: 'Sul', description: 'Alho curitibano' },

    // Sudeste region
    { product: 'Manga', idealMonths: JSON.stringify([11, 12, 1, 2, 3]), region: 'Sudeste', description: 'Manga de São Paulo e Minas' },
    { product: 'Goiaba', idealMonths: JSON.stringify([3, 4, 5, 6, 7, 8]), region: 'Sudeste', description: 'Goiaba branca e vermelha' },
    { product: 'Caqui', idealMonths: JSON.stringify([4, 5, 6, 7]), region: 'Sudeste', description: 'Caqui paulista' },
    { product: 'Milho Verde', idealMonths: JSON.stringify([12, 1, 2, 3]), region: 'Sudeste', description: 'Milho verde de verão' },
    { product: 'Pêra', idealMonths: JSON.stringify([1, 2, 3, 4]), region: 'Sudeste', description: 'Pêra da Serra Gaúcha' },

    // Nordeste region
    { product: 'Manga', idealMonths: JSON.stringify([9, 10, 11, 12]), region: 'Nordeste', description: 'Manga do Vale do São Francisco' },
    { product: 'Melancia', idealMonths: JSON.stringify([10, 11, 12, 1, 2, 3]), region: 'Nordeste', description: 'Melancia nordestina' },
    { product: 'Caju', idealMonths: JSON.stringify([8, 9, 10, 11, 12]), region: 'Nordeste', description: 'Caju do Ceará' },
    { product: 'Umbu', idealMonths: JSON.stringify([12, 1, 2, 3]), region: 'Nordeste', description: 'Umbu do sertão' },
    { product: 'Pitanga', idealMonths: JSON.stringify([10, 11, 12, 1]), region: 'Nordeste', description: 'Pitanga nordestina' },

    // Norte region
    { product: 'Açaí', idealMonths: JSON.stringify([1, 2, 3, 4, 7, 8]), region: 'Norte', description: 'Açaí do Pará' },
    { product: 'Cupuaçu', idealMonths: JSON.stringify([12, 1, 2, 3, 4]), region: 'Norte', description: 'Cupuaçu amazônico' },
    { product: 'Bacuri', idealMonths: JSON.stringify([1, 2, 3, 4, 5]), region: 'Norte', description: 'Bacuri do Maranhão e Pará' },
    { product: 'Guaraná', idealMonths: JSON.stringify([10, 11, 12, 1, 2]), region: 'Norte', description: 'Guaraná do Amazonas' },

    // Centro-Oeste region
    { product: 'Pequi', idealMonths: JSON.stringify([10, 11, 12, 1, 2]), region: 'Centro-Oeste', description: 'Pequi do cerrado' },
    { product: 'Baru', idealMonths: JSON.stringify([8, 9, 10, 11, 12]), region: 'Centro-Oeste', description: 'Baru do cerrado' },
    { product: 'Buriti', idealMonths: JSON.stringify([6, 7, 8, 9]), region: 'Centro-Oeste', description: 'Buriti do cerrado' },

    // Nacional
    { product: 'Banana', idealMonths: JSON.stringify([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]), region: 'Nacional', description: 'Disponível o ano todo' },
    { product: 'Laranja', idealMonths: JSON.stringify([5, 6, 7, 8, 9, 10]), region: 'Nacional', description: 'Melhor época: inverno' },
    { product: 'Abacaxi', idealMonths: JSON.stringify([3, 4, 5, 6, 7, 8, 9]), region: 'Nacional', description: 'Abacaxi pérola e smooth cayenne' },
    { product: 'Mamão', idealMonths: JSON.stringify([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]), region: 'Nacional', description: 'Disponível o ano todo' },
    { product: 'Tomate', idealMonths: JSON.stringify([3, 4, 5, 6, 7, 8]), region: 'Nacional', description: 'Safra principal' },
    { product: 'Alface', idealMonths: JSON.stringify([3, 4, 5, 6, 7, 8, 9]), region: 'Nacional', description: 'Melhor nos meses frescos' },
    { product: 'Cebola', idealMonths: JSON.stringify([1, 2, 3, 8, 9, 10, 11, 12]), region: 'Nacional', description: 'Disponível maior parte do ano' },
  ]

  for (const data of seasonalityData) {
    await prisma.seasonality.create({ data })
  }

  console.log(`Created ${seasonalityData.length} seasonality records`)

  // Create an active shopping list
  await prisma.shoppingList.deleteMany({ where: { householdId: household.id } })
  const shoppingList = await prisma.shoppingList.create({
    data: {
      householdId: household.id,
      items: {
        create: [
          { name: 'Leite Integral', quantity: 6, unit: 'litro', status: 'pending', itemId: createdItems.find(i => i.name === 'Leite Integral')?.id },
          { name: 'Pão de Forma', quantity: 2, unit: 'pacote', status: 'pending', itemId: createdItems.find(i => i.name === 'Pão de Forma')?.id },
          { name: 'Ovos', quantity: 12, unit: 'unidade', status: 'bought', notes: 'Dúzia' },
          { name: 'Manteiga', quantity: 1, unit: 'pacote', status: 'pending' },
          { name: 'Queijo Mussarela', quantity: 200, unit: 'g', status: 'pending', itemId: createdItems.find(i => i.name === 'Queijo Mussarela')?.id },
        ],
      },
    },
  })

  console.log('Created shopping list:', shoppingList.id)

  console.log('\n✅ Seeding complete!')
  console.log('\n📧 Test credentials:')
  console.log('  Admin: admin@test.com / 123456')
  console.log('  Member: member@test.com / 123456')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
