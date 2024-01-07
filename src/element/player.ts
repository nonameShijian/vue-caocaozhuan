import { Ref } from "vue";
import { attackType, walkType } from "../components/GamePlayer.vue";

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

	// 以下是与dom相关
	/** 修改角色动画 */
	changeAnimation: (actionType: 'attack' | 'walk', statusType: attackType | walkType) => void;

	constructor(player: Ref<HTMLDivElement | null>, changeAnimation: (actionType: 'attack' | 'walk', statusType: attackType | walkType) => void) {
		this.hp = this.maxHp = this.mp = this.level = this.attack = this.defence = 1;
		this.node = player.value!;
		this.changeAnimation = changeAnimation;
	}
};