import {Entity} from "../shared/entities/entity";

export type ClientProps = {
    id?: string;
    name: string;
    cpf: string;
    email?: string;
    password?: string;
}

export class ClientEntity extends Entity<ClientProps> {
    constructor(props: ClientProps) {
        super(props);
    }

    get id() {
        return this.props.id;
    }

    set id(id: string) {
        this.props.id = id;
    }

    get name() {
        return this.props.name;
    }

    private set name(name: string) {
        this.props.name = name;
    }

    get cpf() {
        return this.props.cpf;
    }

    private set cpf(cpf: string) {
        this.props.cpf = cpf;
    }

    get password() {
        return this.props.password;
    }

    private set password(password: string) {
        this.props.password = password;
    }

    get email() {
        return this.props.email;
    }

    private set email(email: string) {
        this.props.email = email;
    }
}