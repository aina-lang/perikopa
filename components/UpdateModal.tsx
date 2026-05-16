import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { 
  CloudDownload, 
  WifiOff, 
  CheckCircle2, 
  AlertCircle,
  X,
  RefreshCw
} from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown, Layout } from 'react-native-reanimated';
import theme from '../constants/theme';
import { PerikopaService } from '../services/PerikopaService';
import { usePerikopa } from '../context/PerikopaContext';

interface UpdateModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  isMandatory?: boolean;
}

export default function UpdateModal({ isVisible, onClose, onSuccess, isMandatory = false }: UpdateModalProps) {
  const { refreshFromRemote } = usePerikopa();
  const [status, setStatus] = useState<'checking' | 'available' | 'no-update' | 'error' | 'downloading' | 'success'>('checking');
  const [errorType, setErrorType] = useState<'network' | 'server'>('network');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isVisible) {
      if (isMandatory) {
        handleDownload();
      } else {
        checkUpdate();
      }
    }
  }, [isVisible]);

  const checkUpdate = async () => {
    setStatus('checking');
    try {
      const isAvailable = await PerikopaService.checkForUpdate();
      
      // Petit délai pour l'UX si c'est trop instantané
      setTimeout(() => {
        if (isAvailable) {
          setStatus('available');
        } else {
          setStatus('no-update');
        }
      }, 800);
    } catch (e) {
      setStatus('error');
      setErrorType('network');
      setErrorMsg('Mila internet ianao vao afaka mijery ny fanavaozana.');
    }
  };

  const handleDownload = async () => {
    setStatus('downloading');
    const success = await refreshFromRemote();
    if (success) {
      setStatus('success');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } else {
      setStatus('error');
      setErrorType('network');
      setErrorMsg('Mila internet ianao vao afaka maka ny fandaharana vaovao.');
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'checking':
        return (
          <View className="items-center py-6">
            <Animated.View entering={FadeIn} className="mb-4">
              <ActivityIndicator size="large" color={theme.colors.primary[600]} />
            </Animated.View>
            <Text className="text-center text-[16px] font-bold text-text-primary">
              Mijery fanavaozana...
            </Text>
            <Text className="text-center text-[13px] text-text-tertiary mt-2 px-4">
              Andraso kely, eo am-pijeren ny fandaharam-potoana farany izahay.
            </Text>
          </View>
        );

      case 'available':
        return (
          <View className="items-center py-6">
            <Animated.View entering={FadeInDown} className="mb-4 h-16 w-16 bg-primary-100 rounded-full items-center justify-center">
              <CloudDownload size={32} color={theme.colors.primary[600]} />
            </Animated.View>
            <Text className="text-center text-[18px] font-black text-text-primary">
              Misy Fandaharana Vaovao !
            </Text>
            <Text className="text-center text-[14px] text-text-secondary mt-2 px-6">
              Te-haka ny perikopa farany sy ny teny faneva vaovao ve ianao ?
            </Text>
            
            <View className="w-full mt-8 gap-3">
              <TouchableOpacity 
                onPress={handleDownload}
                className="bg-primary-600 py-4 rounded-2xl items-center shadow-md shadow-primary-600/30"
              >
                <Text className="text-white font-black text-[15px]">Haka ny fanavaozana</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={onClose}
                className="py-3 items-center"
              >
                <Text className="text-text-tertiary font-bold text-[14px]">Hizaha avy eo (Ignorer)</Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'downloading':
        return (
          <View className="items-center py-6">
            <ActivityIndicator size="large" color={theme.colors.primary[600]} className="mb-4" />
            <Text className="text-center text-[16px] font-bold text-text-primary">
              Eo am-pakana ny fandaharana...
            </Text>
            <Text className="text-center text-[13px] text-text-tertiary mt-2">
              Aza akatona ny App.
            </Text>
          </View>
        );

      case 'success':
        return (
          <View className="items-center py-6">
            <Animated.View entering={FadeIn} className="mb-4 h-16 w-16 bg-emerald-100 rounded-full items-center justify-center">
              <CheckCircle2 size={32} color={theme.colors.emerald[600]} />
            </Animated.View>
            <Text className="text-center text-[18px] font-black text-emerald-700">
              Vita soa aman-tsara !
            </Text>
            <Text className="text-center text-[14px] text-text-secondary mt-2">
              Efa vonona ny fandaharana vaovao.
            </Text>
          </View>
        );

      case 'no-update':
        return (
          <View className="items-center py-6">
            <Animated.View entering={FadeIn} className="mb-4 h-16 w-16 bg-blue-50 rounded-full items-center justify-center">
              <CheckCircle2 size={32} color={theme.colors.primary[400]} />
            </Animated.View>
            <Text className="text-center text-[18px] font-black text-text-primary">
              Mbola tsisy fanavaozana
            </Text>
            <Text className="text-center text-[14px] text-text-secondary mt-2 px-6">
              Efa ny dikan-teny farany no ampiasainao.
            </Text>
            <TouchableOpacity 
              onPress={onClose}
              className="mt-8 bg-primary-600 py-4 px-10 rounded-2xl items-center"
            >
              <Text className="text-white font-black text-[15px]">OK</Text>
            </TouchableOpacity>
          </View>
        );

      case 'error':
        return (
          <View className="items-center py-6">
            <Animated.View entering={FadeInDown} className="mb-4 h-16 w-16 bg-gold-100 rounded-full items-center justify-center">
              {errorType === 'network' ? (
                <WifiOff size={32} color={theme.colors.gold[600]} />
              ) : (
                <AlertCircle size={32} color={theme.colors.gold[600]} />
              )}
            </Animated.View>
            <Text className="text-center text-[18px] font-black text-text-primary">
              {errorType === 'network' ? 'Tsy misy internet' : 'Misy olana kely'}
            </Text>
            <Text className="text-center text-[14px] text-text-secondary mt-2 px-6">
              {errorMsg}
            </Text>
            
            <View className="w-full mt-8 gap-3">
              <TouchableOpacity 
                onPress={() => {
                  if (isMandatory) {
                    handleDownload();
                  } else {
                    checkUpdate();
                  }
                }}
                className="bg-primary-600 py-4 rounded-2xl items-center flex-row justify-center gap-2"
              >
                <RefreshCw size={18} color="white" />
                <Text className="text-white font-black text-[15px]">Averina indray</Text>
              </TouchableOpacity>
              
              {!isMandatory && (
                <TouchableOpacity 
                  onPress={onClose}
                  className="py-3 items-center"
                >
                  <Text className="text-text-tertiary font-bold text-[14px]">Hizaha avy eo (Ignorer)</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        );
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={isMandatory ? () => {} : onClose}
    >
      <View className="flex-1 bg-black/60 items-center justify-center px-6">
        <Animated.View 
          entering={FadeInDown.springify()}
          layout={Layout.springify()}
          className="w-full bg-white rounded-[32px] p-6 shadow-2xl overflow-hidden"
        >
          {/* Header simple avec bouton close si on veut */}
          {!isMandatory && (
            <View className="flex-row justify-end mb-2">
              <TouchableOpacity onPress={onClose} className="p-2 -mr-2 bg-slate-50 rounded-full">
                <X size={16} color={theme.colors.text.tertiary} />
              </TouchableOpacity>
            </View>
          )}

          {renderContent()}
          
          <View className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-primary-600 opacity-[0.03]" />
          <View className="absolute -right-10 -bottom-10 h-32 w-32 rounded-full bg-emerald-500 opacity-[0.03]" />
        </Animated.View>
      </View>
    </Modal>
  );
}
