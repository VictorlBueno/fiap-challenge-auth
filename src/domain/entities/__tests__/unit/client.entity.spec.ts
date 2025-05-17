import { ClientEntity, ClientProps } from "@/domain/entities/client.entity";

describe('Entity: Client', () => {
    let client: ClientEntity;
    const clientData: ClientProps = {
        id: 'abc123',
        name: 'Victor',
        cpf: '12345678900',
        email: 'victor@fiap.com',
        password: 'securepass',
    };

    beforeEach(() => {
        client = new ClientEntity({ ...clientData });
    });

    describe('When a client is created', () => {
        it('should expose all properties correctly', () => {
            expect(client.id).toBe('abc123');
            expect(client.name).toBe('Victor');
            expect(client.cpf).toBe('12345678900');
            expect(client.email).toBe('victor@fiap.com');
            expect(client.password).toBe('securepass');
        });
    });

    describe('When the client ID is updated', () => {
        it('should update the ID correctly', () => {
            client.id = 'xyz789';
            expect(client.id).toBe('xyz789');
        });
    });

    describe('When other client properties are updated', () => {
        it('should update the name correctly', () => {
            client.name = 'John';
            expect(client.name).toBe('John');
        });

        it('should update the CPF correctly', () => {
            client.cpf = '98765432100';
            expect(client.cpf).toBe('98765432100');
        });

        it('should update the email correctly', () => {
            client.email = 'john@fiap.com';
            expect(client.email).toBe('john@fiap.com');
        });

        it('should update the password correctly', () => {
            client.password = 'newpassword123';
            expect(client.password).toBe('newpassword123');
        });
    });
});
