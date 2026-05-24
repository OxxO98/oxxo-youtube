import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next'

//CSS@antD
import { Button, Modal, Select } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons'

import type { ShortcutPreset } from '../model/types';

//lib
import { getShortcutMap, getShortcutPresetOptions, hasShortcutKey, isShortcutInGroup } from '../lib/shortcut';

//ui
import { KeyboardMap } from './KeyboardMap';
import { ShortcutLegend } from './ShortcutLegend';
import { ShortcutList } from './ShortcutList';
import { SelectWrapStyle } from './styles';

export const HelpModal = () => {

    //i18n
    const { t } = useTranslation('HelpModal');

    //State
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [shortcutPreset, setShortcutPreset] = useState<ShortcutPreset>('all');
    const [hoveredKey, setHoveredKey] = useState<string | null>(null);
    const [hoveredShortcutId, setHoveredShortcutId] = useState<string | null>(null);

    const shortcutMap = useMemo( () => getShortcutMap(t), [t]);
    const shortcutPresetOptions = useMemo( () => getShortcutPresetOptions(t), [t]);

    const activeShortcuts = shortcutPreset === 'all' ? shortcutMap : shortcutMap.filter( (shortcut) => isShortcutInGroup(shortcut, shortcutPreset) );
    const highlightedShortcutIds = hoveredShortcutId !== null ?
        [hoveredShortcutId] :
        hoveredKey !== null ?
            activeShortcuts.filter( (shortcut) => hasShortcutKey(shortcut, hoveredKey) ).map( (shortcut) => shortcut.id ) :
            [];
    const scrollToShortcutId = hoveredKey !== null ? highlightedShortcutIds[0] ?? null : null;

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleOk = () => {
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    return(
        <>
            <Button onClick={showModal}>{t('BUTTON.TITLE')}<QuestionCircleOutlined /></Button>

            <Modal
                title={t('TITLE')}
                closable={{ 'aria-label': 'Custom Close Button' }}
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                style={{ top : 16 }}
                width={1160}
                footer={[
                    <Button key={'BUTTON.CANCLE'} onClick={handleOk}>{t('BUTTON.CANCLE')}</Button>
                ]}
            >
                <div style={SelectWrapStyle}>
                    <Select<ShortcutPreset>
                        value={shortcutPreset}
                        options={shortcutPresetOptions}
                        onChange={(value) => {
                            setShortcutPreset(value);
                            setHoveredKey(null);
                            setHoveredShortcutId(null);
                        }}
                        style={{ width : 280 }}
                    />
                </div>
                <KeyboardMap
                    shortcuts={activeShortcuts}
                    selectedPreset={shortcutPreset}
                    highlightedShortcutIds={highlightedShortcutIds}
                    onHoverKey={(key) => {
                        setHoveredKey(key);
                        setHoveredShortcutId(null);
                    }}
                />
                <ShortcutList
                    shortcuts={activeShortcuts}
                    selectedPreset={shortcutPreset}
                    highlightedShortcutIds={highlightedShortcutIds}
                    scrollToShortcutId={scrollToShortcutId}
                    onHoverShortcut={(shortcutId) => {
                        setHoveredShortcutId(shortcutId);
                        setHoveredKey(null);
                    }}
                />
                <ShortcutLegend t={t}/>
            </Modal>
        </>
        
    )
}
