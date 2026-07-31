import { useState, useEffect, useCallback, useRef } from 'react';
import * as Network from 'expo-network';

interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean;
  type: Network.NetworkStateType;
}

const defaultState: NetworkState = {
  isConnected: true,
  isInternetReachable: true,
  type: Network.NetworkStateType.UNKNOWN,
};

export function useNetwork() {
  const [networkState, setNetworkState] = useState<NetworkState>(defaultState);
  const previousConnectedRef = useRef(true);
  const listenersRef = useRef<Array<() => void>>([]);

  const checkNetwork = useCallback(async () => {
    try {
      const state = await Network.getNetworkStateAsync();

      const newState: NetworkState = {
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable ?? false,
        type: state.type ?? Network.NetworkStateType.UNKNOWN,
      };

      setNetworkState(newState);

      if (newState.isConnected && !previousConnectedRef.current) {
        listenersRef.current.forEach(cb => cb());
      }

      previousConnectedRef.current = newState.isConnected;
    } catch {
      setNetworkState(defaultState);
    }
  }, []);

  useEffect(() => {
    checkNetwork();

    const interval = setInterval(checkNetwork, 30000);

    return () => {
      clearInterval(interval);
    };
  }, [checkNetwork]);

  const subscribeToReconnect = useCallback((callback: () => void) => {
    listenersRef.current.push(callback);
    return () => {
      listenersRef.current = listenersRef.current.filter(h => h !== callback);
    };
  }, []);

  return {
    ...networkState,
    checkNetwork,
    subscribeToReconnect,
  };
}
