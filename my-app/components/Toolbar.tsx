import { View, StyleSheet, TouchableOpacity } from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";
import Svg, { Path } from 'react-native-svg';
import { SvgUri } from "react-native-svg";
import { Asset } from "expo-asset";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/context/ThemeContext";
import { router } from "expo-router";
export default function ToolbarComponent() {
    const { colorScheme } = useTheme();
    const colors = Colors[colorScheme ?? 'light'];
    
    const handleNewPress = () => {
        router.push('/invoice/create');
    };
    
    // Figma: background #0C0E16, borderRadius 8, label #BCBDC1, font 18px, icon right
    return (
        <ThemedView
            style={styles.toolbarContainer}
        >
            <View style={styles.filterContainer}>
                <ThemedText
                    style={[styles.filterText, { color: colors.text }]}
                >
                    Filter
                </ThemedText>
                <SvgUri
                    uri={Asset.fromModule(require('@/assets/icon-arrow-down.svg')).uri}
                    style={{marginTop: 4}}
                    width={10}
                    height={10}
                />
            </View>

            {/* New Button */}
            <TouchableOpacity
                style={styles.addNewButton}
                onPress={handleNewPress}
                activeOpacity={0.8}
            >
                {/* Plus icon */}
                <View style={styles.addIconContainer}>
                    <SvgUri
                        uri={Asset.fromModule(require('@/assets/icon-plus.svg')).uri}
                        width={10}
                        height={10}
                    />
                </View>
                <ThemedText
                    style={{
                        color: '#fff',
                        fontSize: 16,
                        fontWeight: '700',
                        fontFamily: 'Inter',
                        lineHeight: 22.87,
                    }}
                >
                    New
                </ThemedText>
            </TouchableOpacity>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    toolbarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        // backgroundColor: '#0C0E16',
        borderRadius: 8,
        // paddingHorizontal: 20,
        paddingVertical: 10,
        minWidth: 80,
        minHeight: 40,
        marginLeft: 16,
    },
    addNewButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#7C5DFA',
        borderRadius: 30,
        paddingHorizontal: 10,
        paddingVertical: 10,
        minWidth: 100,
        minHeight: 40,
        shadowColor: '#674FD0',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 2,
    },
    addIconContainer: {
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
        backgroundColor: '#fff',
        borderRadius: 100,
    },
    filterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
        gap: 12
    },
    filterText: {
        // color: '#BCBDC1',
        fontSize: 18,
        fontWeight: '600',
        // fontFamily: 'Inter',
        // marginRight: 10,
    },
})