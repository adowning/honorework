/// Auto-generated file (nest-sdk-generator)
/// Please do not edit this file - re-generate the SDK using the generator instead.
/// Generated on: Wed, 23 Apr 2025 14:57:05 GMT
///
/// Parent module: userModule
/// Controller: "userController" registered as "user" (13 routes)

import { request } from "../central";
import type { UserWithProfile, IUser } from "../_types/src/prisma/types";

export default {
  // GET @ /user/list
  getUserList(
    params: {} = {},
    body: {} = {},
    query: {} = {}
  ): Promise<UserWithProfile[]> {
    return request("GET", `/user/list`, body, query);
  },

  // GET @ /user/me
  getCurrentUser(
    params: {} = {},
    body: {} = {},
    query: {} = {}
  ): Promise<IUser> {
    return request("GET", `/user/me`, body, query);
  },

  // GET @ /user/:id
  findOne(
    params: { id: string },
    body: {} = {},
    query: {} = {}
  ): Promise<UserWithProfile> {
    return request("GET", `/user/${params.id}`, body, query);
  },

  // POST @ /user/cashtag/check
  cashtagCheck(
    params: {},
    body: { cashtag: string },
    query: {} = {}
  ): Promise<boolean | Error> {
    return request("POST", `/user/cashtag/check`, body, query);
  },

  // POST @ /user/cashtag/update/:cashtag
  cashtagUpdate(
    params: { cashtag: any },
    body: {} = {},
    query: {} = {}
  ): Promise<Error | Partial<UserWithProfile>> {
    return request(
      "POST",
      `/user/cashtag/update/${params.cashtag}`,
      body,
      query
    );
  },

  // POST @ /user/check/username
  checkUsernameExists(
    params: {},
    body: any,
    query: {} = {}
  ): Promise<boolean | Error> {
    return request("POST", `/user/check/username`, body, query);
  },

  // POST @ /user/avatar/update
  avatarUpdate(
    params: {},
    body: { avatar: string },
    query: {} = {}
  ): Promise<Error | Partial<UserWithProfile>> {
    return request("POST", `/user/avatar/update`, body, query);
  },

  // POST @ /user/age/update
  ageUpdate(
    params: {},
    body: { age: number },
    query: {} = {}
  ): Promise<Error | Partial<UserWithProfile>> {
    return request("POST", `/user/age/update`, body, query);
  },

  // POST @ /user/lastspin/update
  lastSpinUpdate(
    params: {} = {},
    body: {} = {},
    query: {} = {}
  ): Promise<Partial<UserWithProfile>> {
    return request("POST", `/user/lastspin/update`, body, query);
  },

  // POST @ /user/session
  createPlayerSession(
    params: {} = {},
    body: {} = {},
    query: {} = {}
  ): Promise<{ success: boolean; sessionId: string }> {
    return request("POST", `/user/session`, body, query);
  },

  // POST @ /user/location/update
  locationUpdate(
    params: {},
    body: { location: string },
    query: {} = {}
  ): Promise<Error | Partial<UserWithProfile>> {
    return request("POST", `/user/location/update`, body, query);
  },

  // POST @ /user/username/update
  usernameUpdate(
    params: {},
    body: { username: string },
    query: {} = {}
  ): Promise<Error | Partial<UserWithProfile>> {
    return request("POST", `/user/username/update`, body, query);
  },

  // POST @ /user/gender/update
  genderUpdate(
    params: {},
    body: { gender: string },
    query: {} = {}
  ): Promise<Error | Partial<UserWithProfile>> {
    return request("POST", `/user/gender/update`, body, query);
  },
};
