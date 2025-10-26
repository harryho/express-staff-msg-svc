import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Seed some test employees
  const employees = [
    {
      firstName: 'John',
      lastName: 'Doe',
      startDate: new Date('2020-10-24'),
      birthDate: new Date('1990-05-15'),
      timezone: 'America/New_York',
      locationDisplay: 'New York, USA',
    },
    {
      firstName: 'Jane',
      lastName: 'Smith',
      startDate: new Date('2019-03-10'),
      birthDate: new Date('1985-12-20'),
      timezone: 'America/Los_Angeles',
      locationDisplay: 'Los Angeles, USA',
    },
    {
      firstName: 'Alice',
      lastName: 'Johnson',
      startDate: new Date('2021-06-01'),
      birthDate: new Date('1992-08-30'),
      timezone: 'Australia/Melbourne',
      locationDisplay: 'Melbourne, Australia',
    },
    {
      firstName: 'Bob',
      lastName: 'Williams',
      startDate: new Date('2018-11-15'),
      timezone: 'Europe/London',
      locationDisplay: 'London, UK',
    },
  ];

  for (const employee of employees) {
    await prisma.employee.create({
      data: employee,
    });
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
