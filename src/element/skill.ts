import jsonData from '../data/strategyData.json';
console.log(jsonData);

export class Skill {
	/** 技能名称 */
	strategyName!: string;
	/** 策略类型ID(风系，水系等) */
	strategyTypeID!: number;
	/** 是否一定命中 */
	forceHit!: boolean;
	/** 命中率 */
	hitRateFactor!: number;
	/** 未知 */
	numberFactor!: number;
	/** 技能描述 */
	translation!: string;
	/** 技能消耗的mp */
	consumeMP!: number;
	/** 技能效果简略描述 */
	effect!: string;
	/** 影响范围id(对目标和其周围的人造成效果)，对应 assets/area/areaInfurence 的图片 */
	influenceRangeID!: number;
	/** 使用范围ID(只能指定这个范围的人造成效果)，对应 assets/area/areaStrategy 的图片 */
	strategyUseRangeID!: number;
	/** 未知 */
	Yx!: number;
	/** 未知 */
	pathID!: number;
	/** 技能动画路径id，对应 assets/strategyAnimate 的图片 */
	AnimatePathId!: number;
	/** 技能音效名称，对应 assets/musicEffect 的音频 */
	musicEffect!: string;
	/** 
	 * 特殊技能动画路径id，对应 assets/specialAnimate 的图片 
	 * 
	 * 格式x,y 意思是specialAnimate文件夹下x-0-1.png到x-y-1.png共y个图片
	 **/
	specialAnimate?: string;

	constructor(skillName: string) {
		const skillData = jsonData.find(data => {
			return data.strategyName == skillName;
		});
		if (!skillData) throw new Error(`${skillName}未注册`);
		for (const [key, value] of Object.entries(skillData)) {
			// @ts-ignore
			this[key] = value;
		}
	}
}