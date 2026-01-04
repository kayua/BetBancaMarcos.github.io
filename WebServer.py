#!/usr/bin/env python3
"""
Servidor Multiplayer para Minecraft Ultra Otimizado
Execute: python server.py
"""

import asyncio
import websockets
import json
from datetime import datetime

class GameServer:
    def __init__(self):
        self.players = {}
        self.world_blocks = {}
        self.chat_history = []
        self.max_chat_history = 100

    async def register_player(self, websocket):
        """Registra um novo jogador"""
        player_id = id(websocket)
        self.players[player_id] = {
            'id': player_id,
            'websocket': websocket,
            'position': {'x': 0, 'y': 25, 'z': 0},
            'rotation': {'x': 0, 'y': 0},
            'name': f'Jogador_{player_id % 1000}',
            'health': 20,
            'inventory': [],
            'connected_at': datetime.now().isoformat()
        }
        print(f"✅ Jogador {player_id} conectado ({len(self.players)} jogadores online)")
        return player_id

    async def unregister_player(self, player_id):
        """Remove um jogador"""
        if player_id in self.players:
            player_name = self.players[player_id]['name']
            del self.players[player_id]
            print(f"❌ Jogador {player_id} desconectado ({len(self.players)} jogadores online)")

            # Notificar outros jogadores
            await self.broadcast({
                'type': 'player_disconnect',
                'playerId': player_id,
                'playerName': player_name
            }, exclude=player_id)

    async def broadcast(self, message, exclude=None):
        """Envia mensagem para todos os jogadores"""
        if self.players:
            message_json = json.dumps(message)
            tasks = []
            for player_id, player in self.players.items():
                if player_id != exclude:
                    try:
                        tasks.append(player['websocket'].send(message_json))
                    except:
                        pass
            if tasks:
                await asyncio.gather(*tasks, return_exceptions=True)

    async def send_to_player(self, player_id, message):
        """Envia mensagem para um jogador específico"""
        if player_id in self.players:
            try:
                await self.players[player_id]['websocket'].send(json.dumps(message))
            except:
                pass

    async def handle_message(self, player_id, message):
        """Processa mensagens dos jogadores"""
        try:
            data = json.loads(message)
            msg_type = data.get('type')

            if msg_type == 'player_update':
                # Atualizar posição/rotação do jogador
                if player_id in self.players:
                    self.players[player_id]['position'] = data.get('position', {})
                    self.players[player_id]['rotation'] = data.get('rotation', {})
                    self.players[player_id]['health'] = data.get('health', 20)

                    # Transmitir para outros jogadores
                    await self.broadcast({
                        'type': 'player_update',
                        'playerId': player_id,
                        'position': data.get('position'),
                        'rotation': data.get('rotation'),
                        'health': data.get('health')
                    }, exclude=player_id)

            elif msg_type == 'block_place':
                # Sincronizar colocação de bloco
                block_data = {
                    'x': data['x'],
                    'y': data['y'],
                    'z': data['z'],
                    'type': data['blockType']
                }
                key = f"{data['x']},{data['y']},{data['z']}"
                self.world_blocks[key] = block_data

                await self.broadcast({
                    'type': 'block_place',
                    'playerId': player_id,
                    'x': data['x'],
                    'y': data['y'],
                    'z': data['z'],
                    'blockType': data['blockType']
                }, exclude=player_id)

            elif msg_type == 'block_break':
                # Sincronizar quebra de bloco
                key = f"{data['x']},{data['y']},{data['z']}"
                if key in self.world_blocks:
                    del self.world_blocks[key]

                await self.broadcast({
                    'type': 'block_break',
                    'playerId': player_id,
                    'x': data['x'],
                    'y': data['y'],
                    'z': data['z']
                }, exclude=player_id)

            elif msg_type == 'chat_message':
                # Mensagem de chat
                chat_msg = {
                    'type': 'chat_message',
                    'playerId': player_id,
                    'playerName': self.players[player_id]['name'],
                    'message': data['message'],
                    'timestamp': datetime.now().isoformat()
                }
                self.chat_history.append(chat_msg)

                # Manter histórico limitado
                if len(self.chat_history) > self.max_chat_history:
                    self.chat_history = self.chat_history[-self.max_chat_history:]

                await self.broadcast(chat_msg)

            elif msg_type == 'request_players':
                # Enviar lista de jogadores para o novo jogador
                players_list = []
                for pid, player in self.players.items():
                    if pid != player_id:
                        players_list.append({
                            'playerId': pid,
                            'name': player['name'],
                            'position': player['position'],
                            'rotation': player['rotation'],
                            'health': player['health']
                        })

                await self.send_to_player(player_id, {
                    'type': 'players_list',
                    'players': players_list
                })

            elif msg_type == 'set_name':
                # Atualizar nome do jogador
                if player_id in self.players:
                    old_name = self.players[player_id]['name']
                    new_name = data.get('name', old_name)
                    self.players[player_id]['name'] = new_name

                    print(f"📝 Jogador {player_id} alterou nome: {old_name} → {new_name}")

                    await self.broadcast({
                        'type': 'player_rename',
                        'playerId': player_id,
                        'oldName': old_name,
                        'newName': new_name
                    })

        except json.JSONDecodeError:
            print(f"❌ Erro ao decodificar JSON do jogador {player_id}")
        except Exception as e:
            print(f"❌ Erro ao processar mensagem: {e}")

    async def handler(self, websocket):
        """Handler principal de conexões WebSocket - SEM path"""
        player_id = await self.register_player(websocket)

        try:
            # Enviar ID do jogador
            await websocket.send(json.dumps({
                'type': 'player_id',
                'playerId': player_id,
                'serverTime': datetime.now().isoformat()
            }))

            # Notificar outros jogadores
            await self.broadcast({
                'type': 'player_connect',
                'playerId': player_id,
                'playerName': self.players[player_id]['name']
            }, exclude=player_id)

            # Loop de mensagens
            async for message in websocket:
                await self.handle_message(player_id, message)

        except websockets.exceptions.ConnectionClosed:
            pass
        except Exception as e:
            print(f"❌ Erro no handler: {e}")
        finally:
            await self.unregister_player(player_id)

async def main():
    """Inicia o servidor"""
    server = GameServer()

    print("=" * 60)
    print("🎮 SERVIDOR MULTIPLAYER MINECRAFT ULTRA OTIMIZADO")
    print("=" * 60)
    print(f"🌐 Servidor iniciado em: ws://localhost:8765")
    print(f"📅 Data/Hora: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}")
    print(f"✅ Aguardando conexões...")
    print("=" * 60)
    print()

    # ✅ CORREÇÃO: usar serve() sem async with para versão nova
    async with websockets.serve(server.handler, "localhost", 8765):
        await asyncio.Future()  # Rodar para sempre

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n\n🛑 Servidor encerrado pelo usuário")
    except Exception as e:
        print(f"\n\n❌ Erro fatal no servidor: {e}")