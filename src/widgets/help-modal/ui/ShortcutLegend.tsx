import { GroupColorMap, ShortcutGroups } from '../model/constants';
import { LegendStyle } from './styles';

interface ShortcutLegendProps {
    t : (key : string) => string;
}

export const ShortcutLegend = ({ t } : ShortcutLegendProps) => {
    return (
        <div style={LegendStyle}>
            {
                ShortcutGroups.map( ({ group, labelKey }) => {
                    const colors = GroupColorMap[group];

                    return (
                        <span key={group} style={{ display : 'inline-flex', alignItems : 'center', gap : 6, fontSize : 12 }}>
                            <span style={{ width : 10, height : 10, borderRadius : 10, background : colors.badge }}/>
                            {t(labelKey)}
                        </span>
                    )
                })
            }
        </div>
    )
}
