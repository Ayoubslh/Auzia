import { View,Text } from "react-native";



export default function Welcome() {
  return (
    <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
      <Text style={{fontSize:24,fontWeight:'bold'}}>Bienvenue sur Auzia</Text>
    </View>
  );
}