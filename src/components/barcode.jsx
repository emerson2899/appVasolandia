const BarcodeReader = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [data, setData] = useState(null);

  const askForCameraPermission = () => {
    (async () => {
      const { status } = await Camera.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  };

  const handleBarCodeScanned = ({ data }) => {
    setScanned(true);
    setData(data);
  };

  if (hasPermission === null) {
    askForCameraPermission();
  }

  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      >
        {scanned && (
          <Button
            title={'Tap to Scan Again'}
            onPress={() => setScanned(false)}
          />
        )}
      </BarCodeScanner>
      {scanned && <Text>Scanned Data: {data}</Text>}
    </View>
  );
};

export default BarcodeReader;
