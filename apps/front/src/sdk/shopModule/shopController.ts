/// Auto-generated file (nest-sdk-generator)
/// Please do not edit this file - re-generate the SDK using the generator instead.
/// Generated on: Wed, 23 Apr 2025 14:57:05 GMT
///
/// Parent module: shopModule
/// Controller: "shopController" registered as "shop" (12 routes)

import { request } from "../central";
import type { CreateShopDto } from "../_types/src/modules/shop/dto/create-shop.dto";
import type { UpdateShopDto } from "../_types/src/modules/shop/dto/update-shop.dto";
import type { CreateGameDto } from "../_types/src/modules/shop/dto/create-game.dto";
import type { UpdateGameDto } from "../_types/src/modules/shop/dto/update-game.dto";

export default {
  // GET @ /shop/myshop
  findMyShop(params: {} = {}, body: {} = {}, query: {} = {}): Promise<any> {
    return request("GET", `/shop/myshop`, body, query);
  },

  // POST @ /shop
  createShop(params: {}, body: CreateShopDto, query: {} = {}): Promise<any> {
    return request("POST", `/shop`, body, query);
  },

  // GET @ /shop
  findShops(
    params: {},
    body: {},
    query: { crudQuery: string }
  ): Promise<{
    data: any;
    totalRecords: any;
    pageCount: number;
    page: number;
    pageSize: number;
    orderBy: any[];
  }> {
    return request("GET", `/shop`, body, query);
  },

  // GET @ /shop/:id
  findOneShop(
    params: { id: string },
    body: {},
    query: { crudQuery: string }
  ): Promise<any> {
    return request("GET", `/shop/${params.id}`, body, query);
  },

  // PATCH @ /shop/:id
  updateShop(
    params: { id: string },
    body: UpdateShopDto,
    query: { crudQuery: string }
  ): Promise<any> {
    return request("PATCH", `/shop/${params.id}`, body, query);
  },

  // DELETE @ /shop/:id
  removeShop(
    params: { id: string },
    body: {},
    query: { crudQuery: string }
  ): Promise<null> {
    return request("DELETE", `/shop/${params.id}`, body, query);
  },

  // POST @ /shop/game
  createGame(
    params: {},
    body: CreateGameDto,
    query: { crudQuery: string }
  ): Promise<any> {
    return request("POST", `/shop/game`, body, query);
  },

  // POST @ /shop/game/list
  getGameList(params: {}, body: any, query: {} = {}): Promise<any[]> {
    return request("POST", `/shop/game/list`, body, query);
  },

  // GET @ /shop/game/:id
  findOneGame(
    params: { id: string },
    body: {},
    query: { crudQuery: string }
  ): Promise<any> {
    return request("GET", `/shop/game/${params.id}`, body, query);
  },

  // PATCH @ /shop/game/:id
  updateGame(
    params: { id: string },
    body: UpdateGameDto,
    query: { crudQuery: string }
  ): Promise<any> {
    return request("PATCH", `/shop/game/${params.id}`, body, query);
  },

  // DELETE @ /shop/game/:id
  removeGame(
    params: { id: string },
    body: {},
    query: { crudQuery: string }
  ): Promise<null> {
    return request("DELETE", `/shop/game/${params.id}`, body, query);
  },

  // POST @ /shop/game/seed
  seedGames(params: {}, body: { data: any }, query: {} = {}): Promise<any> {
    return request("POST", `/shop/game/seed`, body, query);
  },
};
