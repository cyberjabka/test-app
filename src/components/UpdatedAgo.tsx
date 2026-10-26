import { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';

type Props = {
  // Момент последней успешной загрузки данных.
  since: Date;
};

// Подпись «Обновлено N сек назад».
export function UpdatedAgo({ since }: Props) {
  const [seconds, setSeconds] = useState(() =>
    Math.max(0, Math.floor((Date.now() - since.getTime()) / 1000))
  );

  useEffect(() => {
    const calculateSeconds = () => {
      setSeconds(Math.max(0, Math.floor((Date.now() - since.getTime()) / 1000)));
    };

    calculateSeconds();
    const interval = setInterval(calculateSeconds, 1000);

    return () => clearInterval(interval);
  }, [since]);

  return <Text style={styles.text}>Обновлено {seconds} сек назад</Text>;
}

const styles = StyleSheet.create({
  text: {
    fontSize: 13,
    color: '#6b7280',
  },
});
