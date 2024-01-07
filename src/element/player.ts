import { Ref } from "vue";
import { attackType, walkType } from "../components/GamePlayer.vue";
import { Skill } from "./skill";

export class Player {
	/** 对应的node元素 */
	node: HTMLDivElement;
	/** 当前血量 */
	hp: number;
	/** 总血量 */
	maxHp: number;
	/** 魔法值 */
	mp: number;
	/** 增益效果列表 */
	buffList: string[] = [];
	/** 负面效果列表 */
	debuffList: string[] = [];
	/** 等级 */
	level: number;
	/** 攻击力 */
	attack: number;
	/** 防御力 */
	defence: number;

	/** 角色名称(还未用到) */
	name?: string;
	/** 角色id(还未用到) */
	id?: number;

	// 以下是与dom相关‘
	/** 角色朝向 */
	toward: attackType;
	/** 修改角色动画 */
	changeAnimation: (actionType: 'attack' | 'walk' | 'skillEffect', statusType: attackType | walkType | Skill) => Promise<void>;
	/** 对其他角色攻击 */
	async attackTo(target: Player) {
		// 判断地方角色位置的代码暂时省略
		// 暂时朝右打
		this.toward = 'right';
		// 攻击动作
		await this.changeAnimation('attack', this.toward);
		// target判断是否格挡(省略)，否则受伤
		await target.changeAnimation('walk', 'damage');
		target.hp -= 6;
		// 判断target是否濒死或死亡
		if (target.hp < 5) {
			await target.changeAnimation('walk', 'dying');
		}
		// 判断是否进行二连击(省略)

		// 攻击后切换为行走状态
		if (this.hp < 5) {
			await this.changeAnimation('walk', 'dying');
		} else {
			await this.changeAnimation('walk', this.toward);
		}
	}
	/** 使用技能 */
	async useSkill(skill: Skill | string, targets: Player[]):Promise<void> {
		if (typeof skill == 'string') {
			return this.useSkill(new Skill(skill), targets);
		}
		// 只对自己使用，应该是面朝下的
		// 其他情况以后判断
		if (targets.length == 1 && targets[0] == this) {
			this.toward = 'bottom';
		} else {
			this.toward = 'top';
		}
		await this.changeAnimation('walk', this.toward);
		// alert(`xx发动了${skill.strategyName}`);
		await Promise.allSettled(targets.map(async target => {
			// 根据技能的类型，目标的动画分为
			// gain, damage, xxBlock
			await target.changeAnimation('walk', 'gain');
			// 技能动画
			await target.changeAnimation('skillEffect', skill);
			// 还原
			await target.changeAnimation('walk', target.toward);
		}));

	}

	constructor(player: Ref<HTMLDivElement | null>, changeAnimation: (actionType: 'attack' | 'walk' | 'skillEffect', statusType: attackType | walkType | Skill) => Promise<void>) {
		this.hp = this.maxHp = this.mp = this.level = this.attack = this.defence = 10;
		this.node = player.value!;
		this.changeAnimation = changeAnimation;
		this.toward = 'top';
	}
};