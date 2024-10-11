import http from "@/util/http";

const router = "env";
class Env {
  async checkInstalled(): Promise<NonNullable<unknown>> {
    return await http.get(`${router}/installed`);
  }
  async getVersions(typeName: string): Promise<NonNullable<unknown>> {
    return await http.get(`${router}/versions`, {
      type: typeName,
    });
  }
  async;
}

export default new Env();
