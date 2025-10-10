// Simple test file to verify realtime functionality
// This can be run in the browser console to test

import { supabase } from '@/lib/supabase';

export async function testRealtime(channelId: string) {
  console.log('Testing realtime functionality for channel:', channelId);
  
  // Test 1: Subscribe to channel
  const channel = supabase.channel(`test:channel:${channelId}`);
  
  channel.on('broadcast', { event: 'test-message' }, (payload) => {
    console.log('Received test message:', payload);
  });
  
  const subscription = await channel.subscribe((status) => {
    console.log('Subscription status:', status);
  });
  
  // Test 2: Send test message
  setTimeout(() => {
    channel.send({
      type: 'broadcast',
      event: 'test-message',
      payload: { test: 'Hello from test!' }
    });
  }, 1000);
  
  // Test 3: Cleanup after 5 seconds
  setTimeout(() => {
    supabase.removeChannel(channel);
    console.log('Test completed');
  }, 5000);
}

// Run this in browser console with: testRealtime('your-channel-id');