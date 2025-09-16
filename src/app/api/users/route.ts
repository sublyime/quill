
import { NextResponse } from 'next/server';
import type { User } from '@/app/users/columns';

// In-memory store to simulate a database
let users: User[] = [
  {
    id: 'usr_1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'Admin',
    status: 'active',
  },
  {
    id: 'usr_2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    role: 'Editor',
    status: 'active',
  },
  {
    id: 'usr_3',
    name: 'Sam Wilson',
    email: 'sam.wilson@example.com',
    role: 'Viewer',
    status: 'inactive',
  },
  {
    id: 'usr_4',
    name: 'Alice Johnson',
    email: 'alice.j@example.com',
    role: 'Editor',
    status: 'active',
  },
];

// GET handler to fetch all users
export async function GET() {
  return NextResponse.json(users);
}

// POST handler to add a new user
export async function POST(request: Request) {
  try {
    const newUser: Omit<User, 'id' | 'status'> = await request.json();
    
    // Basic validation
    if (!newUser.name || !newUser.email || !newUser.role) {
        return NextResponse.json({ message: 'Invalid user data' }, { status: 400 });
    }

    const userWithId: User = {
      ...newUser,
      id: `usr_${Date.now()}`,
      status: 'active', // New users default to active
    };

    users.unshift(userWithId); // Add to the beginning of the array
    
    return NextResponse.json(userWithId, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Error processing request', error }, { status: 500 });
  }
}
