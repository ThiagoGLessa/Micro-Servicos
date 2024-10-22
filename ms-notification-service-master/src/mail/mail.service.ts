import { Injectable } from '@nestjs/common';
import { Mail, MailType, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import * as nodemailer from 'nodemailer';
import DataMessage from './types/message';

@Injectable()
export class MailService {
  private transporter;

  constructor(private prisma: PrismaService) {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.your-email-provider.com',
      port: 587,
      secure: false, 
      auth: {
        user: 'your-email@domain.com',
        pass: 'your-email-password', 
      },
    });
  }

  async getMailByIdUser(where: Prisma.MailWhereInput): Promise<Mail[] | null> {
    return await this.prisma.mail.findMany({ where });
  }

  async sendMail(content: DataMessage, type: string) {
    const mailOptions = {
      from: "seu-email@dominio.com",
      to: this.getDestination(content.idUser), 
      subject: 'Notificação de Pedido', 
      text: this.makeContent(content.orderNumber, content.orderValue),
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email enviado: ' + info.response);
    } catch (error) {
      console.error('Erro ao enviar email: ' + error);
    }
  }

  async persistNotification(content: DataMessage, type: MailType) {
    const data = {
      idUser: content.idUser,
      mailDestination: this.getDestination(content.idUser),
      mailContent: this.makeContent(content.orderNumber, content.orderValue),
      mailType: type,
    };

    await this.prisma.mail.create({
      data: { ...data },
    });
  }

  getDestination(idUser: string) {
    switch (idUser) {
      case '10':
        return 'user@teste.com.br';
      default:
        return 'default@teste.com.br';
    }
  }

  makeContent(orderNumber: number, orderValue: number) {
    return `Número do pedido: ${orderNumber.toString()} \n\n
      Valor do pedido: ${orderValue.toString()}`;
  }
}
