<template>
	<div ref="player" class="player" :style="{ '--player-width': width, '--player-url': url, '--player-position': position }"></div>
</template>

<script setup lang="ts">
import { Ref, onMounted, reactive, ref, watch, defineExpose, nextTick } from 'vue';
import { Player } from '../element/player.ts';
import { Skill } from '../element/skill';

export type attackType = 'top' | 'right' | 'bottom' | 'left';

export type walkType = 'top' | 'right' | 'bottom' | 'left' |
	'topStop' | 'rightStop' | 'bottomStop' | 'leftStop' |
	'topBlock' | 'rightBlock' | 'bottomBlock' | 'leftBlock' |
	'dying' | 'damage' | 'gain';

// 刚出场的角色其实是只有立定和行走两种的
export type playerProp = {
	/**
	 * 角色id
	 */
	id: number,
	/**
	 * 角色类别
	 */
	playerType: 'arm' | 'role',
	/**
	 * 动作类别
	 */
	actionType: 'attack',
	/**
	 * 第几张图片
	 * 
	 * 其实是兵种升级的情况
	 */
	index: number,
	/**
	 * 角色状态类别
	 */
	statusType: attackType,
} | {
	/**
	 * 角色id
	 */
	id: number,
	/**
	 * 角色类别
	 */
	playerType: 'arm' | 'role',
	/**
	 * 动作类别
	 */
	actionType: 'walk',
	/**
	 * 第几张图片
	 */
	index: number,
	/**
	 * 角色状态类别
	 */
	statusType: walkType,
} | {
	/**
	 * 角色id
	 */
	id: number,
	/**
	 * 角色类别
	 */
	playerType: 'arm' | 'role',
	/**
	 * 动作类别
	 */
	actionType: 'skillEffect',
	/**
	 * 第几张图片
	 * 
	 * 其实是兵种升级的情况
	 */
	index: number,
	/**
	 * 角色状态类别
	 */
	statusType: Skill,
};

const props = defineProps<playerProp>();

/**
 * 角色图片宽高
 */
const width = ref(props.actionType == 'walk' ? '48px' : '64px');

/**
 * 角色背景图片
 */
const playerBackground = ref(`url('src/assets/RolePng/${props.playerType}/${props.id}/${props.actionType}/${props.index < 10 && props.playerType == 'arm' ? (props.index + '-1') : props.index}.png')`);
/**
 * 角色背景位置
 */
const playerBackgroundPosition = ref([0, 0]);

/**
 * 船背景图片
 * 
 * 海面上的船 48 * 288 (6张)
 */

const shipBackground = ref(`url('src/assets/object/ship.png')`);
/**
 * 船背景位置
 */
const shipBackgroundPosition = ref([0, 0]);
/**
 * 是否显示船的背景
 */
const showShipBackground = ref(false);

/**
 * 角色debuff背景(中毒，麻痹，禁咒，混乱)
 */
const playerDebuffBackground = ref(`url('src/assets/stateIcon/1.png')`);
/**
 *  角色debuff背景位置(中毒，麻痹，禁咒，混乱)
 */
const playerDebuffBackgroundPosition = ref([0, 0]);
/**
 * 是否显示角色debuff的背景(中毒，麻痹，禁咒，混乱)
 */
const showPlayerDebuffBackground = ref(false);

/**
 * 角色正在接受技能的背景
 */
const playerReceivingSkillEffectsBackground = ref(`url('')`);
/**
 *  角色正在接受技能的背景位置
 */
const playerReceivingSkillEffectsBackgroundPosition = ref([-8, 0]);
/**
 * 是否显示角色正在接受技能的背景
 */
const showPlayerReceivingSkillEffectsBackground = ref(false);

/**
 * 角色背景图片数组
 * 
 * 其中角色应该处于最下方
 */
const urlArray = [playerReceivingSkillEffectsBackground, shipBackground, playerDebuffBackground, playerBackground];
/**
 * 角色背景位置数组
 */
const positionArray = [playerReceivingSkillEffectsBackgroundPosition, shipBackgroundPosition, playerDebuffBackgroundPosition, playerBackgroundPosition];

const updatePosition = () => {
	return positionArray.filter(cur => {
		if (cur == playerReceivingSkillEffectsBackgroundPosition && !showPlayerReceivingSkillEffectsBackground.value) return false;
		if (cur == shipBackgroundPosition && !showShipBackground.value) return false;
		if (cur == playerDebuffBackgroundPosition && !showPlayerDebuffBackground.value) return false;
		return true;
	}).reduce((pre, cur, i, arr) => {
		// @ts-ignore
		return pre + cur.value.map(v => isNaN(v) ? v : (v + 'px')).join(' ') + (i < arr.length - 1 ? ',' : '');
	}, '');
};
/**
 * 按background-position属性给角色动起来的功能，其中x不变，只改变y
 * 
 * 需要动态改变
 */
const position = ref(updatePosition());

const updateUrl = () => {
	return urlArray.filter(cur => {
		if (cur == playerReceivingSkillEffectsBackground && !showPlayerReceivingSkillEffectsBackground.value) return false;
		if (cur == shipBackground && !showShipBackground.value) return false;
		if (cur == playerDebuffBackground && !showPlayerDebuffBackground.value) return false;
		return true;
	}).reduce((pre, cur, i) => {
		return pre + (i > 0 ? ',' : '') + cur.value;
	}, '');
};
/** 所有的背景图片 */
const url = ref(updateUrl());

/**
 * 定时器
 */
let timer: number;

/**
 * 创建动画
 */
const createAnimation = function (fun: () => void | false, time = 500) {
	const callback = () => {
		clearTimeout(timer!);
		if (fun() !== false) {
			timer = setTimeout(callback, time);
		}
	};
	timer = setTimeout(callback, time);
};

/**
 * 修改角色动画
 */
const changeAnimation = function (this: Player, actionType: 'attack' | 'walk' | 'skillEffect', statusType: attackType | walkType | Skill) {
	return new Promise<void>(resolve => {
		clearTimeout(timer!);
		// 更新图片(异步)
		if (animationData.actionType != actionType && actionType != 'skillEffect') animationData.actionType = actionType;
		if (animationData.statusType != statusType && actionType != 'skillEffect') animationData.statusType = statusType;
		if (actionType == 'skillEffect') {
			// @ts-ignore
			const skill: Skill = statusType;
			showPlayerReceivingSkillEffectsBackground.value = true;
			playerReceivingSkillEffectsBackground.value = `url('src/assets/strategyAnimate/${skill.AnimatePathId}.png')`;
		}
		nextTick(() => {
			/** 初始动作位置 */
			let basePosition: number;
			/** 进行了第几个动作 */
			let count = 0;
			/** 一次加多少px */
			let y = parseInt(width.value.slice(0, -2));

			if (actionType == 'attack') {
				/** 
				 * 总共有几个动作
				 * 向xx方向攻击各有四个动作
				 */
				let maxCount = 4;
				switch (statusType) {
					case 'top':
						basePosition = 0 * y;
						break;
					case 'right':
						basePosition = 12 * y;
						break;
					case 'bottom':
						basePosition = 4 * y;
						break;
					case 'left':
						basePosition = 8 * y;
						break;
				}
				playerBackgroundPosition.value[1] = -basePosition!;
				createAnimation(() => {
					count++;
					// 做完一套动作后resolve
					if (count >= maxCount) {
						clearTimeout(timer!);
						resolve();
						return false;
					}
					playerBackgroundPosition.value[1] = -(basePosition + count * y);
				}, 100);
			}
			else if (actionType == 'walk') {
				/** 
				 * 总共有几个动作
				 */
				let maxCount = 0;
				switch (statusType) {
					case 'top':
						basePosition = 0 * y;
						maxCount = 2;
						break;
					case 'right':
						basePosition = 6 * y;
						maxCount = 2;
						break;
					case 'bottom':
						basePosition = 2 * y;
						maxCount = 2;
						break;
					case 'left':
						basePosition = 4 * y;
						maxCount = 2;
						break;
					case 'topStop':
						basePosition = 8 * y;
						break;
					case 'rightStop':
						basePosition = 11 * y;
						break;
					case 'bottomStop':
						basePosition = 9 * y;
						break;
					case 'leftStop':
						basePosition = 10 * y;
						break;
					case 'topBlock':
						basePosition = 14 * y;
						break;
					case 'rightBlock':
						basePosition = 17 * y;
						break;
					case 'bottomBlock':
						basePosition = 15 * y;
						break;
					case 'leftBlock':
						basePosition = 16 * y;
						break;
					case 'dying':
						basePosition = 12 * y;
						maxCount = 2;
						break;
					case 'damage':
						basePosition = 18 * y;
						break;
					case 'gain':
						basePosition = 19 * y;
						break;
				}
				playerBackgroundPosition.value[1] = -basePosition!;
				if (maxCount > 0) {
					createAnimation(() => {
						count++;
						// 做完一套动作后resolve
						if (count >= maxCount) {
							// 只有濒死情况或行走的情况循环动作
							// @ts-ignore
							if (['dying', 'top', 'right', 'bottom', 'left'].includes(statusType)) {
								count = 0;
								resolve();
							} else {
								clearTimeout(timer!);
								resolve();
								return false;
							}
						}
						playerBackgroundPosition.value[1] = -(basePosition + count * y);
					});
				} else {
					// 非停止状态下，如果没有其他的动作可以切换，则切换到行走状态
					// @ts-ignore
					if (!statusType.endsWith('Stop')) {
						setTimeout(resolve, 500);
					} else {
						resolve();
					}
				}
			}
			else if (actionType == 'skillEffect') {
				// @ts-ignore
				const skill: Skill = statusType;
				let y = 64;
				let maxCount = 11;
				createAnimation(() => {
					count++;
					// 做完一套动作后resolve
					if (count >= maxCount) {
						clearTimeout(timer!);
						// 技能动画后面播放增益技能效果
						if (skill.AnimatePathId > 12 && skill.AnimatePathId < 23) {
							// 暂时不处理
							showPlayerReceivingSkillEffectsBackground.value = false;
							resolve();
						} else {
							showPlayerReceivingSkillEffectsBackground.value = false;
							resolve();
						}
						return false;
					}
					playerReceivingSkillEffectsBackgroundPosition.value[1] = -(count * y + 10);
				}, 80);
			}
		});
	});
};

/**
 * 创建数据对象
 * 
 * 里面的每一项数据改变都会引起角色图片数据改变
 */
const animationData = reactive({
	playerType: props.playerType,
	id: props.id,
	actionType: props.actionType,
	index: props.index,
	statusType: props.statusType,
});

/**
 * Position改变重构background-image和background-position
 */
watch(() => [playerBackgroundPosition.value, shipBackgroundPosition.value, playerDebuffBackgroundPosition.value, playerReceivingSkillEffectsBackgroundPosition.value,
showShipBackground.value, showPlayerDebuffBackground.value, showPlayerReceivingSkillEffectsBackground.value], () => {
	// 更新background-position
	position.value = updatePosition();
	// 更新图片背景 background-image
	url.value = updateUrl();
}, { deep: true });

/**
 * 外部改变内部的值时更新
 */
watch(animationData, () => {
	// 更新背景位置
	playerBackground.value = `url('src/assets/RolePng/${animationData.playerType}/${animationData.id}/${animationData.actionType}/${animationData.index < 10 && animationData.playerType == 'arm' ? (animationData.index + '-1') : animationData.index}.png')`;
	// 更新背景图片
	url.value = updateUrl();
	// 更新元素宽高
	width.value = animationData.actionType == 'walk' ? '48px' : '64px';
	// 清除动画计时器
	// clearTimeout(timer!);
	// 重新设置动画
	// newPlayer.changeAnimation(animationData.actionType, animationData.statusType);
}, { deep: true });

const player: Ref<HTMLDivElement | null> = ref(null);

const newPlayer = new Player(player, changeAnimation);

// 导出
defineExpose({
	// animationData,
	player: newPlayer,
});

onMounted(() => {
	newPlayer.node = player.value!;

	// 设置动画
	newPlayer.changeAnimation(animationData.actionType, animationData.statusType);
});
</script>

<style>
/* 每个图片是64*1024或48*960px */
/* 每个attack图片是64*64px */
/* 每个walk图片是48*48px */
.player {
	width: var(--player-width);
	height: var(--player-width);
	background-image: var(--player-url);
	background-position: var(--player-position);
	background-repeat: no-repeat;
}
</style>