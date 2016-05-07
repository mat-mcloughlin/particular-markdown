let spawn = require('child_process').spawn;
import Style from './style';


export default class Provider {
    private _ipc : any;
    private _promise : Promise<string>;
    _resolver : any; 
    private _response : string;

    constructor()
    {
        let processEnv = process.env.MARKDOWN_CONSOLE || "C:\\Git\\particularmarkdown\\ParticularDocsCore\\MarkdownConsole.exe";
        this._ipc = spawn(processEnv);
    
        this._ipc.stderr.on('data', (data) => {
            console.error(data.toString());
        });
    
        this._ipc.stdout.on('data', (data) => {
            console.log(data.toString());
            
            this._response += data.toString();
                                        
            if (this._response.endsWith('|||')) {
                this._resolver(this.decorate(this._response.replace('|||', '')));
                                    
                this._response = '';
                
                this._promise = new Promise<string>((resolve, reject) => {
                    this._resolver = resolve;
                });
            }
        }); 
    
        this._promise = new Promise<string>((resolve, reject) => {
            this._resolver = resolve;
        });
    }
    
    private decorate(response : string) : string {
       
        
        return '<style>' + Style.css + '</style>' + '<body>' + response + '</body>';
    }

    public Process(text : string, filename : string): Promise<string> {
        var message = { location: filename.toLowerCase(), markdown: text };
    
        this._ipc.stdin.write(JSON.stringify(message) + "\n");
                
        return this._promise;
    }
    
}