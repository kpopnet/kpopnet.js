declare module "@biowasm/aioli" {
  export class Aioli {
    [key: string]: any;
  }
  const AioliCtor: {
    new (opts: any): Promise<Aioli>;
  };
  export default AioliCtor;
}
