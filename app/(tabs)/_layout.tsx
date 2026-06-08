import { Link, Tabs } from 'expo-router';

import { HeaderButton } from '../../components/HeaderButton';
import { TabBarIcon } from '../../components/TabBarIcon';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: 'black',
      }}>
      <Tabs.Screen
        name="diaspora"
        options={{
          title: 'Diaspora',
          headerShown:false,
          tabBarIcon: ({ color }) => <TabBarIcon name="globe" color={color} />,
         
        }}
      />
      <Tabs.Screen
        name="produits"
        options={{
          title: 'Produits',
          headerShown:false,
          tabBarIcon: ({ color }) => <TabBarIcon name="cube" color={color} />,
        }}  
      />
       <Tabs.Screen
        name="facture"
        options={{
          title: 'Facture',
          headerShown:false,
          tabBarIcon: ({ color }) => <TabBarIcon name="check" color={color} />,
        }}
      />
     
      <Tabs.Screen
        name="livraison"
        options={{
          title: 'Livraison',
          headerShown:false,
          tabBarIcon: ({ color }) => <TabBarIcon name="truck" color={color} />,
        }}
      />
       <Tabs.Screen
        name="announces"
        options={{
          title: 'Annonces',
          headerShown:false,
          tabBarIcon: ({ color }) => <TabBarIcon name="phone" color={color} />,
        }}
      />
     
    </Tabs>
  );
}
