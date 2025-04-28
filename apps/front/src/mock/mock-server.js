// Import required modules using ES modules syntax
import express from 'express';
const app = express();
import http from 'http';
import { faker } from '@faker-js/faker';
import { WebSocketServer } from 'ws';

// const { string, internet, phone, image, person, number, datatype, date, location, finance } = faker;


app.use(express.json());

const mockVipInfo = {
  vip_level: 5, // Example VIP level
  next_level: 6, // Example next level
  level_name: 'VIP 5', // Example level name
  level_progress: 75, // Example progress to next level
  level_up_amount: 10000, // Example level up amount
  total_bet: 50000, // Example total bet amount
  total_deposit: 25000, // Example total deposit amount
  rebate: 0.008, // Example rebate percentage
};
const mockVipLevels = [
  {
    id: 1, // Example level ID
    name: 'VIP 1', // Example level name
    bet_amount: 1000, // Example bet amount required
    deposit_amount: 500, // Example deposit amount required
    rebate: 0.001, // Example rebate percentage
    upgrade_reward: 100, // Example upgrade reward amount
  },
  {
    id: 2,
    name: 'VIP 2',
    bet_amount: 2000,
    deposit_amount: 1000,
    rebate: 0.002,
    upgrade_reward: 200,
  },
  {
    id: 3,
    name: 'VIP 3',
    bet_amount: 3000,
    deposit_amount: 1500,
    rebate: 0.003,
    upgrade_reward: 300,
  },
  {
    id: 4,
    name: 'VIP 4',
    bet_amount: 4000,
    deposit_amount: 2000,
    rebate: 0.004,
    upgrade_reward: 400,
  },
  {
    id: 5,
    name: 'VIP 5',
    bet_amount: 5000,
    deposit_amount: 2500,
    rebate: 0.005,
    upgrade_reward: 500,
  },
  {
    id: 6,
    name: 'VIP 6',
    bet_amount: 6000,
    deposit_amount: 3000,
    rebate: 0.006,
    upgrade_reward: 600,
  },
  {
    id: 7,
    name: 'VIP 7',
    bet_amount: 7000,
    deposit_amount: 3500,
    rebate: 0.007,
    upgrade_reward: 700,
  },
  {
    id: 8,
    name: 'VIP 8',
    bet_amount: 8000,
    deposit_amount: 4000,
    rebate: 0.008,
    upgrade_reward: 800,
  },
  {
    id: 9,
    name: 'VIP 9',
    bet_amount: 9000,
    deposit_amount: 4500,
    rebate: 0.009,
    upgrade_reward: 900,
  },
  {
    id: 10,
    name: 'VIP 10',
    bet_amount: 10000,
    deposit_amount: 5000,
    rebate: 0.01,
    upgrade_reward: 1000,
  },
];
const mockVipTasks = [
  {
    id: 1, // Example task ID
    type: 'daily', // Example task type
    name: 'Daily Deposit', // Example task name
    description: 'Deposit daily to receive rewards', // Example description
    status: 'active', // Example task status
  },
  {
    id: 2,
    type: 'weekly',
    name: 'Weekly Bet',
    description: 'Bet weekly to receive rewards',
    status: 'completed',
  },
  {
    id: 3,
    type: 'monthly',
    name: 'Monthly Deposit',
    description: 'Deposit monthly to receive rewards',
    status: 'pending',
  },
  {
    id: 4,
    type: 'daily',
    name: 'Daily Sign In',
    description: 'Sign in daily to receive rewards',
    status: 'active',
  },
  {
    id: 5,
    type: 'weekly',
    name: 'Weekly Tasks',
    description: 'Complete weekly tasks to receive rewards',
    status: 'completed',
  },
  {
    id: 6,
    type: 'monthly',
    name: 'Monthly Tasks',
    description: 'Complete monthly tasks to receive rewards',
    status: 'pending',
  },
];
const mockVipRebateHistory = {
  total: 10,
  list: [
    { id: 1, amount: 10, date: '2024-01-01' },
    { id: 2, amount: 20, date: '2024-01-02' },
    { id: 3, amount: 30, date: '2024-01-03' },
    { id: 4, amount: 40, date: '2024-01-04' },
    { id: 5, amount: 50, date: '2024-01-05' },
    { id: 6, amount: 60, date: '2024-01-06' },
    { id: 7, amount: 70, date: '2024-01-07' },
    { id: 8, amount: 80, date: '2024-01-08' },
    { id: 9, amount: 90, date: '2024-01-09' },
    { id: 10, amount: 100, date: '2024-01-10' },
  ],
};
const mockVipLevelRewardHistory = {
  total: 5,
  list: [
    { id: 1, level: 1, reward: 100, date: '2024-01-01' },
    { id: 2, level: 2, reward: 200, date: '2024-01-05' },
    { id: 3, level: 3, reward: 300, date: '2024-01-10' },
    { id: 4, level: 4, reward: 400, date: '2024-01-15' },
    { id: 5, level: 5, reward: 500, date: '2024-01-20' },
  ],
};
const mockVipTimesHistory = {
  total: 2,
  list: [
    { id: 1, type: 'weekly', reward: 100, date: '2024-01-07' },
    { id: 2, type: 'monthly', reward: 500, date: '2024-01-31' },
  ],
};

const mockCurrencyList = [
  {
    id: '1',
    name: 'USD',
    fiat: true,
    symbol: '$',
    type: 'USD',
    balance: '1000.00',
  },
  {
    id: '2',
    name: 'BRL',
    fiat: true,
    symbol: 'R$',
    type: 'BRL',
    balance: '2000.00',
  },
  {
    id: '3',
    name: 'EUR',
    fiat: true,
    symbol: '€',
    type: 'EUR',
    balance: '1500.00',
  }
];

const mockVipSignIn = {
  award: [
    { day: 1, reward: 10, claimed: true },
    { day: 2, reward: 20, claimed: false },
    { day: 3, reward: 30, claimed: false },
    { day: 4, reward: 40, claimed: false },
    { day: 5, reward: 50, claimed: false },
    { day: 6, reward: 60, claimed: false },
    { day: 7, reward: 70, claimed: false },
  ],
  signin_day: 2, // Example current sign-in day
  is_signin: 1, // Example whether today's sign-in is completed
  limited_bet: 1000, // Example limited bet amount
  limited_deposit: 500, // Example limited deposit amount
  vip_level: 5, // Example VIP level
};
const mockVipLevelUpList = {
  total: 2,
  list: [
    { id: 1, level: 6, reward: 1000, claimed: false },
    { id: 2, level: 7, reward: 2000, claimed: false },
  ],
};

const mockVipLevelAward = {
  award_list: [
    {
        id:1,
        name: 'Upgrade Reward',
        level: 6,
        reward: 1000,
        type:5,
        claimed: false,
    },
    {
        id:2,
        name: 'Upgrade Reward',
        level: 7,
        reward: 2000,
        type:5,
        claimed: false,
    },
    {
        id:3,
        name: 'Segment Reward',
        level: 8,
        reward: 3000,
        type:6,
        claimed: false,
    }
  ],
};
const mockVipCycleawardList = {
    award_list: [
        {
            id: 1,
            name: 'Member Day',
            reward: 1000,
            type: 1,
            claimed: false
        },
        {
            id: 2,
            name: 'Daily Reward',
            reward: 10,
            type: 2,
            claimed: false
        },
        {
            id: 3,
            name: 'Weekly Reward',
            reward: 500,
            type: 3,
            claimed: false
        },
        {
            id: 4,
            name: 'Monthly Reward',
            reward: 2000,
            type: 4,
            claimed: false
        }
    ]
};
const mockBetawardList = {
    award_list: [
        {
            id: 1,
            name: 'Bet Reward',
            reward: 0.008,
            type: 7,
            claimed: false,
            bet_amount: 10000,
        }
    ]
};





// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocketServer({ server, path: "/user/connect/ws" });



// Define port
const PORT = 3001;

// Mock data
let mockToken = 'mock_token';
const mockUser = {
  uid: '1234-1234-1234-1234-1234', // Generate UUID
  name: 'ash', // Generate username
  email: 'asdf@asdf.com', // Generate email
  phone: '19035555555', // Generate phone number
  avatar: '10', // Generate avatar URL
  first_name: 'asdf', 
  last_name: 'asdf', 
  id: '1', 
  id_number: 1,
  email_confirmd: true,
  phone_confirmd: true,
  date_of_birth: '03/06/1975',
  county: 'Smith',// county(),
  state: 'tx',
  city: 'tyler',
  address:'123 abc street',
  postal_code: '74791', //location.zipCode(),
  language: 'en',// location.locale(),
  locale: 'US',
  initial_profile_complete: 'false', // Generate boolean
  is_supended: 0, // Generate number
  sys_communications: 'false', // Generate boolean
  locked_personal_info_fields: [], // You can make this dynamic if needed
  create_at: new Date().toISOString(),
};


const mockUserAmount = {
  amount: 100,
  currency: {
    fiat: 'true',
    name: 'notsure',
    symbol:'$',
    type: 'USD'
  },
  withdraw: 111111,
  rate: 1000,
};
const mockUserBalance = {
  bal: '1000',
  cur: 'BRL',
  mt: '1000',
  last_updated: new Date().toISOString(),
  transactions: '100',
};

app.get('/user/balance/list', (req, res) => {
  const token = req.headers.authorization;
  if (token === mockToken || token === 'Bearer ' + mockToken) {
    res.status(200).json({ code: 200, data: mockCurrencyList });
  } else {
    res.status(401).json({ code: 1003, message: 'Unauthorized' });
  }
});
// get vip level api
app.get('/user/viplevels', (req, res) => {
  const token = req.headers.authorization;
  if (token === mockToken || token === 'Bearer ' + mockToken) {
    res.status(200).json({ code: 200, data: mockVipLevels });
  } else {
    res.status(401).json({ code: 1003, message: 'Unauthorized' });
  }
});



// API Endpoints
// POST /login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'testuser' && password === 'testpassword') {
    // console.log(mockUser)
    res.status(200).json({ code: 200, token: mockToken, user: mockUser });
  } else {
    res.status(400).json({ code: 1001, message: 'Invalid credentials' });
  }
});

// POST /register
app.post('/register', (req, res) => {
  const { uid } = req.body;
  if (uid === 'existinguser') {
    res.status(400).json({ code: 1002, message: 'User already exists' });
  } else {
    res.status(200).json({ code: 200, token: mockToken });
  }
});

// GET /user-info
app.get('/user/info', (req, res) => {
  const token = req.headers.authorization;
  if (token === mockToken || token === 'Bearer ' + mockToken) {
    res.status(200).json({ code: 200, data: mockUser });
  } else {
    res.status(401).json({ code: 1003, message: 'Unauthorized' });
  }
});

// GET /user-amount
app.get('/user/amount', (req, res) => {
  const token = req.headers.authorization;
  if (token === mockToken || token === 'Bearer ' + mockToken) {
    res.status(200).json({ code: 200, data: mockUserAmount });
  } else {
    res.status(401).json({ code: 1003, message: 'Unauthorized' });
  }
});

// POST /user-change
app.post('/user/change', (req, res) => {
  const token = req.headers.authorization;
  if (token === mockToken || token === 'Bearer ' + mockToken) {
    res.status(200).json({ code: 200, message: 'User info updated successfully' });
  } else {
    res.status(401).json({ code: 1003, message: 'Unauthorized' });
  }
});

// GET /user-balance
app.get('/user/balance', (req, res) => {
  const token = req.headers.authorization;
  if (token === mockToken || token === 'Bearer ' + mockToken) {
    res.status(200).json({ code: 200, data: mockUserBalance });
  } else {
    res.status(401).json({ code: 1003, message: 'Unauthorized' });
  }
});

// POST /user-email
app.post('/user/email', (req, res) => {
  if (token === mockToken || token === 'Bearer ' + mockToken) {
    res.status(200).json({ code: 200, message: 'User email updated successfully' });
  } else {
    res.status(401).json({ code: 1003, message: 'Unauthorized' });
  }
});

// POST /user-password
app.post('/user/password', (req, res) => {
  if (token === mockToken || token === 'Bearer ' + mockToken) {
    res.status(200).json({ code: 200, message: 'User password updated successfully' });
  } else {
    res.status(401).json({ code: 1003, message: 'Unauthorized' });
  }
});

// POST /user-suspend
app.post('/user/suspend', (req, res) => {
  if (token === mockToken || token === 'Bearer ' + mockToken) {
    res.status(200).json({ code: 200, message: 'User suspended successfully' });
  } else {
    res.status(401).json({ code: 1003, message: 'Unauthorized' });
  }
});
//POST /user/currency
app.post('/user/currency', (req, res) => {
  if (token === mockToken || token === 'Bearer ' + mockToken) {
    res.status(200).json({ code: 200, message: 'User currency updated successfully' });
  } else {
    res.status(401).json({ code: 1003, message: 'Unauthorized' });
  }
});

//POST /user/check
app.post('/user/check', (req, res) => {
  if (token === mockToken || token === 'Bearer ' + mockToken) {
    res.status(200).json({ code: 200, message: 'User checked successfully' });
  } else {
    res.status(401).json({ code: 1003, message: 'Unauthorized' });
  }
});
//POST /user/verifyemail
app.post('/user/verifyemail', (req, res) => {
  if (token === mockToken || token === 'Bearer ' + mockToken) {
    res.status(200).json({ code: 200, message: 'User email verified successfully' });
  }

  else {
    res.status(401).json({ code: 1003, message: 'Unauthorized' });
  }
});
// get vip info api
app.get('/user/vipinfo', (req, res) => {
  const token = req.headers.authorization;
  if (token === mockToken || token === 'Bearer ' + mockToken) {
    res.status(200).json({ code: 200, data: mockVipInfo });
  } else {
    res.status(401).json({ code: 1003, message: 'Unauthorized' });
  }
});

// get vip tasks api
app.get('/user/viptasks', (req, res) => {
  const token = req.headers.authorization;
  if (token === mockToken || token === 'Bearer ' + mockToken) {
    res.status(200).json({ code: 200, data: mockVipTasks });
  } else {
    res.status(401).json({ code: 1003, message: 'Unauthorized' });
  }
});

// get vip level award api
app.post('/user/viplevel/award', (req, res) => {
  const token = req.headers.authorization;
  if (token === mockToken || token === 'Bearer ' + mockToken) {
    res.status(200).json({ code: 200, data: { message: 'Award received' } });
  } else {
    res.status(401).json({ code: 1003, message: 'Unauthorized' });
  }
});
// get vip rebate award api
app.post('/user/viprebate/award', (req, res) => {
  const token = req.headers.authorization;
  if (token === mockToken || token === 'Bearer ' + mockToken) {
    res.status(200).json({ code: 200, data: { message: 'Rebate award received' } });
  } else {
    res.status(401).json({ code: 1003, message: 'Unauthorized' });
  }
});
// get vip coding record api
app.get('/user/viprebatehistory', (req, res) => {
  const token = req.headers.authorization;
  if (token === mockToken || token === 'Bearer ' + mockToken) {
    res.status(200).json({ code: 200, data: mockVipRebateHistory });
  } else {
    res.status(401).json({ code: 1003, message: 'Unauthorized' });
  }
});
// get vip level reward record api
app.get('/user/viplevelawardhistory', (req, res) => {
  const token = req.headers.authorization;
  if (token === mockToken || token === 'Bearer ' + mockToken) {
    res.status(200).json({ code: 200, data: mockVipLevelRewardHistory });
  } else {
    res.status(401).json({ code: 1003, message: 'Unauthorized' });
  }
});
// get vip weekly and monthly reward records api
app.get('/user/viptimeshistory', (req, res) => {
  const token = req.headers.authorization;
  if (token === mockToken || token === 'Bearer ' + mockToken) {
    res.status(200).json({ code: 200, data: mockVipTimesHistory });
  } else {
    res.status(401).json({ code: 1003, message: 'Unauthorized' });
  }
});
// Receive VIP sign-in rewards api
app.post('/user/vipsignin/award', (req, res) => {
  const token = req.headers.authorization;
  if (token === mockToken || token === 'Bearer ' + mockToken) {
    res.status(200).json({ code: 200, message: 'Sign-in rewards received' });
  } else {
    res.status(401).json({ code: 1003, message: 'Unauthorized' });
  }
});
// get vip check-in content api
app.get('/user/vip/signinaward/list', (req, res) => {
  const token = req.headers.authorization;
  if (token === mockToken || token === 'Bearer ' + mockToken) {
    res.status(200).json({ code: 200, data: mockVipSignIn });
  } else {
    res.status(401).json({ code: 1003, message: 'Unauthorized' });
  }
});

// Get sign-in rewards api
app.post('/user/vip/signinaward/receive', (req, res) => {
  const token = req.headers.authorization;
  if (token === mockToken || token === 'Bearer ' + mockToken) {
    res.status(200).json({ code: 200, message: 'Sign-in reward received' });
  } else {
    res.status(401).json({ code: 1003, message: 'Unauthorized' });
  }
});
// get vip upgrade list api
app.get('/user/viplevelup/list', (req, res) => {
  const token = req.headers.authorization;
  if (token === mockToken || token === 'Bearer ' + mockToken) {
    res.status(200).json({ code: 200, data: mockVipLevelUpList });
  } else {
    res.status(401).json({ code: 1003, message: 'Unauthorized' });
  }
});

// Receive VIP upgrade rewards api
app.post('/user/viplevelup/receive', (req, res) => {
  const token = req.headers.authorization;
  if (token === mockToken || token === 'Bearer ' + mockToken) {
    res.status(200).json({ code: 200, data: { message: 'VIP upgrade reward received' } });
  } else {
    res.status(401).json({ code: 1003, message: 'Unauthorized' });
  }
});

// Get periodic rewards api
app.get('/user/vip/cycleaward/list', (req, res) => {
  const token = req.headers.authorization;
  if (token === mockToken || token === 'Bearer ' + mockToken) {
    res.status(200).json({ code: 200, data: mockVipCycleawardList });
  } else {
    res.status(401).json({ code: 1003, message: 'Unauthorized' });
  }
});

// Receive periodic rewards api
app.post('/user/vip/cycleaward/receive', (req, res) => {
  const token = req.headers.authorization;
  if (token === mockToken || token === 'Bearer ' + mockToken) {
    res.status(200).json({ code: 200, data: { message: 'Periodic reward received' } });
  } else {
    res.status(401).json({ code: 1003, message: 'Unauthorized' });
  }
});

// Get level-related rewards api
app.get('/user/vip/levelaward/list', (req, res) => {
  const token = req.headers.authorization;
  if (token === mockToken || token === 'Bearer ' + mockToken) {
    res.status(200).json({ code: 200, data: mockVipLevelAward });
  } else {
    res.status(401).json({ code: 1003, message: 'Unauthorized' });
  }
});

// Receive level-related rewards api
app.post('/user/vip/levelaward/receive', (req, res) => {
  const token = req.headers.authorization;
  if (token === mockToken || token === 'Bearer ' + mockToken) {
    res.status(200).json({ code: 200, data: { message: 'Level-related reward received' } });
  } else {
    res.status(401).json({ code: 1003, message: 'Unauthorized' });
  }
});
// Get coding rebates api
app.get('/user/vip/betaward/list', (req, res) => {
  const token = req.headers.authorization;
  if (token === mockToken || token === 'Bearer ' + mockToken) {
    res.status(200).json({ code: 200, data: mockBetawardList });
  } else {
    res.status(401).json({ code: 1003, message: 'Unauthorized' });
  }
});

// Receive coding rebates api
app.post('/user/vip/betaward/receive', (req, res) => {
  const token = req.headers.authorization;
  if (token === mockToken || token === 'Bearer ' + mockToken) {
    res.status(200).json({ code: 200, data: { message: 'Coding rebate received' } });
  } else {
    res.status(401).json({ code: 1003, message: 'Unauthorized' });
  }
});

// WebSocket connection handling

wss.on('connection', (ws) => {
  console.log('Client connected to WebSocket');

  // Send initial message upon connection
  ws.send(JSON.stringify(mockUserBalance));

  // Handle WebSocket messages from client
  ws.on('message', (message) => {
    console.log('Received:', message);
  });

  // Handle WebSocket connection close
  ws.on('close', () => {
    console.log('Client disconnected from WebSocket');
  });

  // Handle WebSocket errors
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Mock server listening on port ${PORT}`);
});