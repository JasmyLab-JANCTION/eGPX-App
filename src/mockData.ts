export const mockBlockchainStats = {
  activeWorkers: 1247,
  totalTasksCompleted: 5843,
  framesRendered: 2847530,
  avgFrameRenderTime: 2.4,
  totalValueDistributed: 3847500,
  networkUptime: 99.97,
};

export const mockWorkers = [
  {
    id: 'w1',
    name: 'RenderPro Studio',
    os: 'Linux',
    cpu: 'AMD Ryzen 9 5950X',
    gpus: ['RTX 3090', 'RTX 3090'],
    software: ['Blender 3.6', 'Cycles'],
    reputation: 4.9,
    completedTasks: 450,
    avgFrameTime: 1.8,
    rewardPerTask: 45,
    staked: 5000,
    earned: 18500,
    active: true,
  },
  {
    id: 'w2',
    name: 'FastFrames Inc',
    os: 'Windows',
    cpu: 'Intel i9-13900KS',
    gpus: ['RTX 4090'],
    software: ['Blender 4.0', 'EEVEE'],
    reputation: 4.8,
    completedTasks: 385,
    avgFrameTime: 2.1,
    rewardPerTask: 42,
    staked: 3500,
    earned: 15200,
    active: true,
  },
];

export const mockTasks = [
  {
    id: 'task-001',
    title: 'Sci-Fi Corridor Animation',
    file: 'corridor_scene.blend',
    startFrame: 1,
    endFrame: 240,
    status: 'completed',
    submittedAt: '2024-01-14',
    workersAssigned: 3,
    cost: 320,
  },
  {
    id: 'task-002',
    title: 'Product Visualization',
    file: 'product_render.blend',
    startFrame: 1,
    endFrame: 120,
    status: 'rendering',
    submittedAt: '2024-01-15',
    workersAssigned: 2,
    cost: 180,
    progress: 65,
  },
];

export const configurationOptions = {
  os: [
    { value: 'linux', label: 'Linux', workers: 234 },
    { value: 'windows', label: 'Windows', workers: 189 },
    { value: 'mac', label: 'macOS', workers: 45 },
  ],
  renderingSoftware: [
    { value: 'blender', label: 'Blender', workers: 342, versions: ['3.5', '3.6', '4.0', '4.1'] },
    { value: 'lumion', label: 'Lumion', workers: 87, versions: ['13', '14', '15'] },
  ],
};

export const pricingTiers = [
  {
    name: 'Eco',
    description: 'Budget-friendly, 4-6 hours',
    pricePerFrame: 0.12,
    estimatedTime: '4-6 hours',
    workers: 'Available: 34',
    color: '#64748b',
  },
  {
    name: 'Standard',
    description: 'Balanced, 2-3 hours',
    pricePerFrame: 0.24,
    estimatedTime: '2-3 hours',
    workers: 'Available: 156',
    color: '#C5A065',
    recommended: true,
  },
  {
    name: 'Turbo',
    description: 'Premium, <1 hour',
    pricePerFrame: 0.42,
    estimatedTime: '<1 hour',
    workers: 'Available: 89',
    color: '#0F6D43',
  },
];

export const mockUserProfile = {
  name: 'Alex Rivera',
  email: 'alex@studio.com',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
  jctBalance: 15000,
  jctStaked: 8000,
  jctAvailable: 7000,
  reputation: 4.8,
  completedTasks: 523,
  earnings: 24800,
  twoFactorEnabled: false,
};
