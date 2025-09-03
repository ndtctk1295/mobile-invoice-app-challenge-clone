import { View, StyleSheet, TouchableOpacity } from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";
import Svg, { Path } from 'react-native-svg';
import { SvgUri } from "react-native-svg";
import { Asset } from "expo-asset";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/context/ThemeContext";
import { router } from "expo-router";
import { useState } from "react";

interface ToolbarProps {
    onFilterChange?: (filters: string[]) => void;
}

export default function ToolbarComponent({ onFilterChange }: ToolbarProps) {
    const { colorScheme } = useTheme();
    const colors = Colors[colorScheme ?? 'light'];
    const [showFilters, setShowFilters] = useState(false);
    const [selectedFilters, setSelectedFilters] = useState<string[]>(['All']);
    
    const handleNewPress = () => {
        router.push('/invoice/create');
    };

    const handleFilterPress = () => {
        setShowFilters(!showFilters);
    };

    const handleFilterSelect = (filter: string) => {
        let newFilters: string[];
        
        if (filter === 'All') {
            newFilters = ['All'];
        } else {
            // Remove 'All' if it's selected and user selects a specific filter
            const filtersWithoutAll = selectedFilters.filter(f => f !== 'All');
            
            if (selectedFilters.includes(filter)) {
                // Remove the filter if it's already selected
                newFilters = filtersWithoutAll.filter(f => f !== filter);
                // If no filters left, select 'All'
                if (newFilters.length === 0) {
                    newFilters = ['All'];
                }
            } else {
                // Add the filter
                newFilters = [...filtersWithoutAll, filter];
            }
        }
        
        setSelectedFilters(newFilters);
        onFilterChange?.(newFilters);
    };

    const getFilterLabel = () => {
        if (selectedFilters.includes('All') || selectedFilters.length === 0) {
            return 'Filter';
        } else if (selectedFilters.length === 1) {
            return selectedFilters[0];
        } else {
            return `${selectedFilters.length} filters`;
        }
    };
    
    // Figma: background #0C0E16, borderRadius 8, label #BCBDC1, font 18px, icon right
    return (
        <ThemedView
            style={styles.toolbarContainer}
        >
            <TouchableOpacity style={styles.filterContainer} onPress={handleFilterPress}>
                <ThemedText
                    style={[styles.filterText, { color: colors.text }]}
                >
                    {getFilterLabel()}
                </ThemedText>
                <SvgUri
                    uri={Asset.fromModule(require('@/assets/icon-arrow-down.svg')).uri}
                    style={{marginTop: 4}}
                    width={10}
                    height={10}
                />
            </TouchableOpacity>

            {/* Filter Dropdown */}
            {showFilters && (
                <ThemedView style={[styles.filterDropdown, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                    {['All', 'Draft', 'Pending', 'Paid'].map((filter) => (
                        <TouchableOpacity
                            key={filter}
                            style={styles.filterOption}
                            onPress={() => handleFilterSelect(filter)}
                        >
                            <View style={styles.filterOptionContent}>
                                <View style={[styles.checkbox, selectedFilters.includes(filter) && { backgroundColor: colors.primary }]}>
                                    {selectedFilters.includes(filter) && (
                                        <SvgUri
                                            uri={Asset.fromModule(require('@/assets/icon-check.svg')).uri}
                                            width={10}
                                            height={8}
                                        />
                                    )}
                                </View>
                                <ThemedText style={[styles.filterOptionText, { color: colors.text }]}>
                                    {filter}
                                </ThemedText>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ThemedView>
            )}

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
        minWidth: 210,
        minHeight: 40,
        width: 210,
        marginLeft: 16,
        position: 'relative',
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
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 8,
        gap: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    filterText: {
        // color: '#BCBDC1',
        fontSize: 18,
        fontWeight: '600',
        // flex: 1,
        // fontFamily: 'Inter',
        // marginRight: 10,
    },
    filterDropdown: {
        position: 'absolute',
        top: 50,
        left: 0,
        width: 192,
        borderWidth: 1,
        borderRadius: 8,
        paddingVertical: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        zIndex: 1000,
    },
    filterOption: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    filterOptionContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    checkbox: {
        width: 16,
        height: 16,
        borderWidth: 1,
        borderColor: '#DFE3FA',
        borderRadius: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    filterOptionText: {
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: -0.25,
    },
})