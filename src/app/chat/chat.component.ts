import { Component, OnInit } from '@angular/core';
import { Client } from '@stomp/stompjs';
import * as SockJS from 'sockjs-client';
import { Mensaje } from './models/mensaje';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {
  private client: Client;
  conectado: boolean;
  mensaje:Mensaje = new Mensaje();
  mensajes: Mensaje[] = [];
  constructor() { this.conectado= false }

  ngOnInit() {
    this.client = new Client();
    this.client.webSocketFactory = ()=>{
      return new SockJS("http://localhost:5000/chat-websocket");
    }

    this.client.onConnect =(frame) =>{
      this.conectado = true;
      this.client.subscribe('/chat/mensaje', e =>{
        let mensaje: Mensaje = JSON.parse(e.body) as Mensaje;
        mensaje.fecha = new Date(mensaje.fecha);
        this.mensajes.push(mensaje);
        console.log(mensaje);
      })

      this.mensaje.tipo = 'NUEVO_USUARIO';
      this.client.publish({destination: '/app/mensaje', 
                          body:  JSON.stringify(this.mensaje)});

      console.log("conectados: " + this.client.connected + " : "+ frame);
    }

   

   this.client.onDisconnect = (frame) =>{
     this.conectado = false;
     console.log("desconectados: " + !this.client.connected + " : "+ frame);
   }

  }

  desconectar(): void{
    this.client.deactivate();
  }

  conectar(): void{
    this.client.activate();
  }


  enviarMensaje() : void{
    this.mensaje.tipo = 'MENSAJE'
      this.client.publish({destination: '/app/mensaje', 
                          body:  JSON.stringify(this.mensaje)});
      this.mensaje.texto = '';
  }

}
