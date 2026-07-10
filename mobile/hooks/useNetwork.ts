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
  const [previousConnected, setPreviousConnected] = useState(true);
  const listenersRef = useRef<Array<() => void>>([]);

  const checkNetwork = useCallback(async () => {
    try {
      const state = await Network.getNetworkStateAsync();

      const newState: NetworkState = {
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable ?? false,
        type: state.type ?? Network.NetworkStateType.UNKNOWN,
      };

      setNetworkState(prev => {
        setPreviousConnected(prev.isConnected);
        return newState;
      });
    } catch {
      setNetworkState(defaultState);
    }
  }, []);

  useEffect(() => {
    checkNetwork();

    const interval = setInterval(checkNetwork, 30000);

    return () => {
      clearInterval(interval);
      listenersRef.current.forEach(unsub => unsub());
    };
  }, [checkNetwork]);

  const onReconnect = useCallback(
    (callback: () => void) => {
      if (networkState.isConnected && !previousConnected) {
        callback();
      }
    },
    [networkState.isConnected, previousConnected]
  );

  const subscribeToReconnect = useCallback((callback: () => void) => {
    const handler = () => callback();
    listenersRef.current.push(handler);
    return () => {
      listenersRef.current = listenersRef.current.filter(h => h !== handler);
    };
  }, []);

  return {
    ...networkState,
    checkNetwork,
    onReconnect,
    subscribeToReconnect,
  };
}
