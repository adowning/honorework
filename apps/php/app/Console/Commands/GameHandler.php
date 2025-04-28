// app/Console/Commands/HandleGame.php
<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use VanguardLTE\Games\NarcosNET\Server;

class HandleGame extends Command
{
    protected $signature = 'game:handle 
        {--action= : Game action (spin, init, respin)}
        {--userId= : User ID}
        {--bet=0 : Bet amount}
        {--lines=20 : Number of lines}
        {--denom=1 : Denomination}';

    protected $description = 'Handle slot game requests';

    public function handle()
    {
        try {
            $game = 'NarcosNET'; // Match your game directory name
            $server = new Server();
            
            // Simulate Laravel request context
            $_GET = [
                'action' => $this->option('action'),
                'slotEvent' => 'bet',
                'bet_betlevel' => $this->option('bet'),
                'bet_denomination' => $this->option('denom')
            ];

            \Auth::loginUsingId($this->option('userId'));
            
            ob_start();
            $server->get(request(), $game);
            $response = ob_get_clean();

            echo json_encode([
                'success' => true,
                'data' => $response
            ]);
            
        } catch (\Exception $e) {
            echo json_encode([
                'success' => false,
                'error' => $e->getMessage(),
                'trace' => $e->getTrace()
            ]);
        }
    }
}